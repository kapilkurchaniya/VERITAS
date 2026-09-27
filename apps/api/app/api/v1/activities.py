import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.core.security import require_roles
from app.models.user import User, RoleName
from app.models.schedule import Activity, ActivityDependency
from app.schemas.schedule import ActivityResponse, ActivityDependencyResponse

router = APIRouter(prefix="/activities", tags=["Activities"])

@router.get("", response_model=List[ActivityResponse])
async def list_activities(
    schedule_version_id: uuid.UUID = Query(...),
    wbs_level: Optional[str] = None,
    discipline: Optional[str] = None,
    location: Optional[str] = None,
    current_user: User = Depends(require_roles([RoleName.ADMIN, RoleName.PROJECT_MANAGER, RoleName.PLANNER, RoleName.SUPERVISOR, RoleName.AUDITOR])),
    db: AsyncSession = Depends(get_db)
):
    """List activities for a specific schedule version."""
    stmt = select(Activity).where(Activity.schedule_version_id == schedule_version_id)
    
    if wbs_level:
        stmt = stmt.where(Activity.wbs_level == wbs_level)
    if discipline:
        stmt = stmt.where(Activity.discipline == discipline)
    if location:
        stmt = stmt.where(Activity.location == location)
        
    stmt = stmt.order_by(Activity.activity_code)
    # We could implement pagination here, but keeping it simple for now
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: uuid.UUID,
    current_user: User = Depends(require_roles([RoleName.ADMIN, RoleName.PROJECT_MANAGER, RoleName.PLANNER, RoleName.SUPERVISOR, RoleName.AUDITOR])),
    db: AsyncSession = Depends(get_db)
):
    """Get single activity detail."""
    activity = await db.get(Activity, activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity

@router.get("/{activity_id}/dependencies", response_model=List[ActivityDependencyResponse])
async def get_activity_dependencies(
    activity_id: uuid.UUID,
    current_user: User = Depends(require_roles([RoleName.ADMIN, RoleName.PROJECT_MANAGER, RoleName.PLANNER, RoleName.SUPERVISOR, RoleName.AUDITOR])),
    db: AsyncSession = Depends(get_db)
):
    """Get predecessors and successors for an activity."""
    # We fetch both where it is predecessor and where it is successor
    stmt = select(ActivityDependency).where(
        (ActivityDependency.predecessor_id == activity_id) | 
        (ActivityDependency.successor_id == activity_id)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
