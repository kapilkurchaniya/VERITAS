import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.core.security import require_roles
from app.models.user import User, RoleName
from app.models.execution import ExecutionEvent, EventStatus
from app.schemas.execution import ExecutionEventResponse

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("", response_model=List[ExecutionEventResponse])
async def list_events(
    project_id: uuid.UUID = Query(...),
    status: Optional[EventStatus] = Query(None),
    current_user: User = Depends(require_roles([
        RoleName.ADMIN, RoleName.PROJECT_MANAGER, 
        RoleName.PLANNER, RoleName.SUPERVISOR, RoleName.AUDITOR
    ])),
    db: AsyncSession = Depends(get_db)
):
    """List execution events."""
    stmt = select(ExecutionEvent).where(ExecutionEvent.project_id == project_id)
    if status:
        stmt = stmt.where(ExecutionEvent.status == status)
        
    stmt = stmt.options(selectinload(ExecutionEvent.evidence)).order_by(ExecutionEvent.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{event_id}", response_model=ExecutionEventResponse)
async def get_event(
    event_id: uuid.UUID,
    current_user: User = Depends(require_roles([
        RoleName.ADMIN, RoleName.PROJECT_MANAGER, 
        RoleName.PLANNER, RoleName.SUPERVISOR, RoleName.AUDITOR
    ])),
    db: AsyncSession = Depends(get_db)
):
    """Get single execution event."""
    stmt = select(ExecutionEvent).where(ExecutionEvent.id == event_id).options(selectinload(ExecutionEvent.evidence))
    result = await db.execute(stmt)
    event = result.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
