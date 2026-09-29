import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.execution import ExecutionEvent, EventStatus
from app.models.schedule import Activity
from app.models.variance import Variance, VarianceType, SeverityLevel
import structlog
from app.services.notifications import notification_service

logger = structlog.get_logger(__name__)


class VarianceEngine:
    """
    Computes variances when an event is APPROVED.
    
    Three variance dimensions:
      1. SCHEDULE — compares actual date against planned start/end
      2. QUANTITY — compares reported quantity against planned quantity
      3. SEQUENCE — detects out-of-order execution against predecessor chain
    """

    async def compute(self, session: AsyncSession, event_id: uuid.UUID) -> List[Variance]:
        """Entry point: compute all applicable variances for an approved event."""
        event = await session.get(
            ExecutionEvent, event_id,
            options=[selectinload(ExecutionEvent.matched_activity)]
        )
        if not event or event.status != EventStatus.APPROVED or not event.matched_activity:
            return []

        activity = event.matched_activity
        extracted = event.extracted_data or {}
        variances: List[Variance] = []

        # ── 1. Schedule Variance ──────────────────────────────
        sv = self._compute_schedule_variance(event, activity, extracted)
        if sv:
            variances.append(sv)

        # ── 2. Quantity Variance ──────────────────────────────
        qv = self._compute_quantity_variance(event, activity, extracted)
        if qv:
            variances.append(qv)

        # ── 3. Sequence Variance ──────────────────────────────
        seq_v = await self._compute_sequence_variance(session, event, activity)
        if seq_v:
            variances.append(seq_v)

        for v in variances:
            session.add(v)
            if v.severity in (SeverityLevel.WARNING, SeverityLevel.CRITICAL):
                import os
                notification_service.send_alert(
                    subject=f"{v.severity.value.upper()} Variance Alert: {activity.activity_code}",
                    body=f"Variance detected for activity {activity.activity_code}:\n\nType: {v.variance_type.value}\nSummary: {v.summary}",
                    to_email=os.getenv("EMAIL_USER")
                )

        await session.commit()
        logger.info(
            "VarianceEngine: computed",
            event_id=str(event_id),
            count=len(variances),
            types=[v.variance_type.value for v in variances],
        )
        return variances

    # ──────────────────────────────────────────────────────────
    # Schedule Variance
    # ──────────────────────────────────────────────────────────
    def _compute_schedule_variance(
        self, event: ExecutionEvent, activity: Activity, extracted: dict
    ) -> Optional[Variance]:
        """
        Compare the reported timestamp against the activity's planned window.
        Positive delta_days = late, negative = early.
        """
        actual_str = extracted.get("end_time") or extracted.get("start_time")
        if not actual_str:
            # Fall back to the event creation time as a rough proxy
            actual_date = event.created_at
        else:
            try:
                actual_date = datetime.fromisoformat(actual_str.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                actual_date = event.created_at

        reference_date = activity.planned_end or activity.planned_start
        if not reference_date:
            return None

        # Make both tz-aware for comparison
        if actual_date.tzinfo is None:
            actual_date = actual_date.replace(tzinfo=timezone.utc)
        if reference_date.tzinfo is None:
            reference_date = reference_date.replace(tzinfo=timezone.utc)

        delta = (actual_date - reference_date).total_seconds() / 86400  # days

        severity = SeverityLevel.INFO
        if abs(delta) > 7:
            severity = SeverityLevel.CRITICAL
        elif abs(delta) > 3:
            severity = SeverityLevel.WARNING

        direction = "late" if delta > 0 else "early"
        summary = (
            f"Activity '{activity.activity_code}' reported {abs(delta):.1f} day(s) {direction} "
            f"vs planned {'end' if activity.planned_end else 'start'}."
        )

        return Variance(
            project_id=event.project_id,
            event_id=event.id,
            activity_id=activity.id,
            variance_type=VarianceType.SCHEDULE,
            severity=severity,
            planned_start=activity.planned_start,
            planned_end=activity.planned_end,
            actual_date=actual_date,
            delta_days=round(delta, 2),
            summary=summary,
            details={"direction": direction},
        )

    # ──────────────────────────────────────────────────────────
    # Quantity Variance
    # ──────────────────────────────────────────────────────────
    def _compute_quantity_variance(
        self, event: ExecutionEvent, activity: Activity, extracted: dict
    ) -> Optional[Variance]:
        """Compare reported quantity against planned quantity."""
        reported_qty = extracted.get("quantity")
        if reported_qty is None or activity.quantity is None:
            return None

        try:
            reported_qty = float(reported_qty)
        except (ValueError, TypeError):
            return None

        delta = reported_qty - activity.quantity
        pct = (delta / activity.quantity * 100) if activity.quantity else 0

        severity = SeverityLevel.INFO
        if abs(pct) > 25:
            severity = SeverityLevel.CRITICAL
        elif abs(pct) > 10:
            severity = SeverityLevel.WARNING

        direction = "over" if delta > 0 else "under"
        summary = (
            f"Activity '{activity.activity_code}': reported {reported_qty} {activity.unit or 'units'} "
            f"vs planned {activity.quantity} ({direction} by {abs(pct):.1f}%)."
        )

        return Variance(
            project_id=event.project_id,
            event_id=event.id,
            activity_id=activity.id,
            variance_type=VarianceType.QUANTITY,
            severity=severity,
            planned_quantity=activity.quantity,
            actual_quantity=reported_qty,
            quantity_delta=round(delta, 2),
            summary=summary,
            details={"percentage": round(pct, 2), "direction": direction},
        )

    # ──────────────────────────────────────────────────────────
    # Sequence Variance
    # ──────────────────────────────────────────────────────────
    async def _compute_sequence_variance(
        self, session: AsyncSession, event: ExecutionEvent, activity: Activity
    ) -> Optional[Variance]:
        """
        Detect out-of-order execution:
        If the current activity has predecessors that have NOT yet been
        approved, flag a SEQUENCE variance.
        """
        from app.models.schedule import ActivityDependency

        # Find predecessor activities for this activity
        stmt = select(ActivityDependency).where(ActivityDependency.successor_id == activity.id)
        result = await session.execute(stmt)
        dependencies = result.scalars().all()

        if not dependencies:
            return None

        predecessor_ids = [d.predecessor_id for d in dependencies]

        # Check if any predecessor has an APPROVED event
        approved_stmt = (
            select(ExecutionEvent)
            .where(ExecutionEvent.matched_activity_id.in_(predecessor_ids))
            .where(ExecutionEvent.status == EventStatus.APPROVED)
        )
        approved_result = await session.execute(approved_stmt)
        approved_predecessor_ids = {e.matched_activity_id for e in approved_result.scalars().all()}

        missing = set(predecessor_ids) - approved_predecessor_ids
        if not missing:
            return None  # All predecessors completed — no sequence issue

        # Fetch missing predecessor activity codes for a readable summary
        missing_stmt = select(Activity).where(Activity.id.in_(missing))
        missing_result = await session.execute(missing_stmt)
        missing_activities = missing_result.scalars().all()
        missing_codes = [a.activity_code for a in missing_activities]

        severity = SeverityLevel.WARNING
        if len(missing) > 2:
            severity = SeverityLevel.CRITICAL

        summary = (
            f"Activity '{activity.activity_code}' was completed before "
            f"{len(missing)} predecessor(s): {', '.join(missing_codes)}."
        )

        return Variance(
            project_id=event.project_id,
            event_id=event.id,
            activity_id=activity.id,
            variance_type=VarianceType.SEQUENCE,
            severity=severity,
            summary=summary,
            details={"missing_predecessors": missing_codes},
        )
