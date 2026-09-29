import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.core.deps import require_roles
from app.models.user import User, RoleName
from app.models.schedule import Schedule, ScheduleVersion
from app.schemas.schedule import ScheduleResponse, ScheduleVersionResponse
from app.services.schedule_service import ScheduleService

router = APIRouter(prefix="/schedules", tags=["Schedules"])

from fastapi import BackgroundTasks
from app.services.matching import MatchEngine

@router.post("/import", response_model=ScheduleVersionResponse)
async def import_schedule(
    background_tasks: BackgroundTasks,
    project_id: uuid.UUID = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles([RoleName.ADMIN, RoleName.PLANNER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload and parse XLSX/CSV schedule for a project.
    Creates a new schedule version and generates activities & dependencies.
    """
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV and XLSX files are supported")
        
    version = await ScheduleService.import_schedule_csv(
        session=db,
        project_id=project_id,
        file=file,
        user_id=current_user.id
    )
    
    # Trigger vector embedding generation for semantic search
    matcher = MatchEngine()
    background_tasks.add_task(matcher.compute_embeddings_background, version.id)
    
    return version

@router.get("/project/{project_id}", response_model=List[ScheduleResponse])
async def get_schedules_for_project(
    project_id: uuid.UUID,
    current_user: User = Depends(require_roles([RoleName.ADMIN, RoleName.PROJECT_MANAGER, RoleName.PLANNER, RoleName.SUPERVISOR, RoleName.AUDITOR])),
    db: AsyncSession = Depends(get_db)
):
    """Get all schedules for a project (usually just 1 master schedule)."""
    result = await db.execute(select(Schedule).where(Schedule.project_id == project_id))
    return result.scalars().all()

@router.get("/{schedule_id}/versions", response_model=List[ScheduleVersionResponse])
async def get_schedule_versions(
    schedule_id: uuid.UUID,
    current_user: User = Depends(require_roles([RoleName.ADMIN, RoleName.PLANNER, RoleName.PROJECT_MANAGER])),
    db: AsyncSession = Depends(get_db)
):
    """Get version history for a schedule."""
    result = await db.execute(
        select(ScheduleVersion)
        .where(ScheduleVersion.schedule_id == schedule_id)
        .order_by(ScheduleVersion.version_num.desc())
    )
    return result.scalars().all()
