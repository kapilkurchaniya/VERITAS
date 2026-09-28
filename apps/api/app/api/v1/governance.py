import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.core.deps import require_roles
from app.models.user import User, RoleName
from app.models.execution import ExecutionEvent, EventStatus
from app.models.variance import Variance, VarianceType, SeverityLevel
from app.schemas.execution import ExecutionEventResponse
from app.services.variance_engine import VarianceEngine

router = APIRouter(prefix="/governance", tags=["Governance"])

@router.get("/queue", response_model=List[ExecutionEventResponse])
async def get_governance_queue(
    project_id: uuid.UUID = Query(...),
    current_user: User = Depends(require_roles([RoleName.ADMIN, RoleName.PROJECT_MANAGER, RoleName.PLANNER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get items requiring governance (REVIEW_REQUIRED or MATCHED but pending approval).
    """
    stmt = (
        select(ExecutionEvent)
        .where(ExecutionEvent.project_id == project_id)
        .where(ExecutionEvent.status.in_([EventStatus.MATCHED, EventStatus.REVIEW_REQUIRED]))
        .options(selectinload(ExecutionEvent.evidence), selectinload(ExecutionEvent.matched_activity))
        .order_by(ExecutionEvent.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/{event_id}/approve")
async def approve_event(
    event_id: uuid.UUID,
    override_activity_id: Optional[uuid.UUID] = Body(None, embed=True),
    current_user: User = Depends(require_roles([RoleName.ADMIN, RoleName.PROJECT_MANAGER, RoleName.PLANNER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Approve an event, finalizing its match to the schedule.
    Optionally override the AI's matched activity.
    Then triggers the Variance Engine to compute deviations.
    """
    event = await db.get(ExecutionEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if event.status not in [EventStatus.MATCHED, EventStatus.REVIEW_REQUIRED]:
        raise HTTPException(status_code=400, detail="Event is not in a governable state")

    if override_activity_id:
        event.matched_activity_id = override_activity_id
        
    if not event.matched_activity_id:
        raise HTTPException(status_code=400, detail="Cannot approve an event without a matched activity")
        
    event.status = EventStatus.APPROVED
    await db.commit()
    
    # ── Trigger Variance Engine ───────────────────────────
    engine = VarianceEngine()
    variances = await engine.compute(db, event_id)
    
    return {
        "message": "Event approved successfully",
        "variances_generated": len(variances),
    }

@router.post("/{event_id}/reject")
async def reject_event(
    event_id: uuid.UUID,
    current_user: User = Depends(require_roles([RoleName.ADMIN, RoleName.PROJECT_MANAGER, RoleName.PLANNER])),
    db: AsyncSession = Depends(get_db)
):
    """Reject an event."""
    event = await db.get(ExecutionEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    event.status = EventStatus.REJECTED
    await db.commit()
    
    return {"message": "Event rejected"}

# ──────────────────────────────────────────────────────────────
# Variance Query Endpoints
# ──────────────────────────────────────────────────────────────

@router.get("/variances")
async def list_variances(
    project_id: uuid.UUID = Query(...),
    variance_type: Optional[VarianceType] = Query(None),
    severity: Optional[SeverityLevel] = Query(None),
    current_user: User = Depends(require_roles([
        RoleName.ADMIN, RoleName.PROJECT_MANAGER,
        RoleName.PLANNER, RoleName.AUDITOR
    ])),
    db: AsyncSession = Depends(get_db)
):
    """List all variances for a project, with optional filters."""
    stmt = (
        select(Variance)
        .where(Variance.project_id == project_id)
        .options(selectinload(Variance.activity))
        .order_by(Variance.created_at.desc())
    )
    if variance_type:
        stmt = stmt.where(Variance.variance_type == variance_type)
    if severity:
        stmt = stmt.where(Variance.severity == severity)

    result = await db.execute(stmt)
    rows = result.scalars().all()

    # Serialize manually since we don't have a Pydantic model for Variance yet
    return [
        {
            "id": str(v.id),
            "project_id": str(v.project_id),
            "event_id": str(v.event_id),
            "activity_id": str(v.activity_id) if v.activity_id else None,
            "activity_code": v.activity.activity_code if v.activity else None,
            "activity_name": v.activity.name if v.activity else None,
            "variance_type": v.variance_type.value,
            "severity": v.severity.value,
            "delta_days": v.delta_days,
            "planned_quantity": v.planned_quantity,
            "actual_quantity": v.actual_quantity,
            "quantity_delta": v.quantity_delta,
            "summary": v.summary,
            "details": v.details,
            "created_at": v.created_at.isoformat(),
        }
        for v in rows
    ]

@router.get("/variances/summary")
async def variance_summary(
    project_id: uuid.UUID = Query(...),
    current_user: User = Depends(require_roles([
        RoleName.ADMIN, RoleName.PROJECT_MANAGER,
        RoleName.PLANNER, RoleName.AUDITOR
    ])),
    db: AsyncSession = Depends(get_db)
):
    """Aggregate variance KPIs for a project dashboard."""
    base = select(Variance).where(Variance.project_id == project_id)

    total_result = await db.execute(select(func.count()).select_from(base.subquery()))
    total = total_result.scalar() or 0

    crit_result = await db.execute(
        select(func.count()).select_from(
            base.where(Variance.severity == SeverityLevel.CRITICAL).subquery()
        )
    )
    critical = crit_result.scalar() or 0

    warn_result = await db.execute(
        select(func.count()).select_from(
            base.where(Variance.severity == SeverityLevel.WARNING).subquery()
        )
    )
    warnings = warn_result.scalar() or 0

    avg_delta_result = await db.execute(
        select(func.avg(Variance.delta_days)).where(
            Variance.project_id == project_id,
            Variance.variance_type == VarianceType.SCHEDULE,
            Variance.delta_days.is_not(None),
        )
    )
    avg_delta = avg_delta_result.scalar()

    return {
        "total_variances": total,
        "critical": critical,
        "warnings": warnings,
        "info": total - critical - warnings,
        "avg_schedule_delta_days": round(avg_delta, 2) if avg_delta else 0,
    }

