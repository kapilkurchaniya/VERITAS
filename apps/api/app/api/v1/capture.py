import uuid
import os
import aiofiles
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.core.security import require_roles
from app.models.user import User, RoleName
from app.models.execution import ExecutionEvent, Evidence, SourceType, EventStatus
from app.schemas.execution import ExecutionEventResponse, EvidenceResponse

router = APIRouter(prefix="/capture", tags=["Capture"])

UPLOAD_DIR = "uploads"

@router.post("", response_model=ExecutionEventResponse)
async def submit_event(
    project_id: uuid.UUID = Form(...),
    raw_input: str = Form(None),
    source_type: SourceType = Form(SourceType.TEXT),
    current_user: User = Depends(require_roles([RoleName.SUPERVISOR, RoleName.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a field update (e.g. text).
    Sets status to PENDING_PROCESSING. AI pipeline processes this later.
    """
    if source_type == SourceType.TEXT and not raw_input:
        raise HTTPException(status_code=400, detail="raw_input is required for TEXT source")
        
    event = ExecutionEvent(
        project_id=project_id,
        reported_by_id=current_user.id,
        source_type=source_type,
        raw_input=raw_input,
        status=EventStatus.PENDING_PROCESSING
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event

@router.post("/upload", response_model=EvidenceResponse)
async def upload_evidence(
    project_id: uuid.UUID = Form(...),
    event_id: uuid.UUID = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles([RoleName.SUPERVISOR, RoleName.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload an evidence file.
    Optionally links it immediately to an event_id.
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_id = uuid.uuid4()
    extension = os.path.splitext(file.filename)[1]
    safe_filename = f"{file_id}{extension}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
        file_size = len(content)

    evidence = Evidence(
        id=file_id,
        project_id=project_id,
        uploaded_by_id=current_user.id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file.content_type or "application/octet-stream",
        file_size=file_size
    )
    db.add(evidence)
    
    if event_id:
        event = await db.get(ExecutionEvent, event_id)
        if event:
            event.evidence.append(evidence)
            
    await db.commit()
    await db.refresh(evidence)
    return evidence
