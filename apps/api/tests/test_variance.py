import pytest
import uuid
from datetime import datetime, timedelta, timezone
from app.models.execution import ExecutionEvent, EventStatus
from app.models.schedule import Activity
from app.models.variance import VarianceType, SeverityLevel
from app.services.variance_engine import VarianceEngine

def test_schedule_variance_late():
    engine = VarianceEngine()
    
    activity = Activity(
        id=uuid.uuid4(),
        activity_code="L6-001",
        planned_start=datetime.now(timezone.utc) - timedelta(days=10),
        planned_end=datetime.now(timezone.utc) - timedelta(days=5),
    )
    
    event = ExecutionEvent(
        id=uuid.uuid4(),
        project_id=uuid.uuid4(),
        status=EventStatus.APPROVED,
        created_at=datetime.now(timezone.utc)
    )
    
    # Reported 4 days after planned_end
    extracted = {
        "end_time": (activity.planned_end + timedelta(days=4)).isoformat()
    }
    
    v = engine._compute_schedule_variance(event, activity, extracted)
    
    assert v is not None
    assert v.variance_type == VarianceType.SCHEDULE
    assert v.severity == SeverityLevel.WARNING # 4 days late
    assert v.delta_days == 4.0
    assert "late" in v.summary
    assert v.details["direction"] == "late"

def test_quantity_variance_under():
    engine = VarianceEngine()
    
    activity = Activity(
        id=uuid.uuid4(),
        activity_code="L6-002",
        quantity=100.0,
        unit="m3"
    )
    
    event = ExecutionEvent(
        id=uuid.uuid4(),
        project_id=uuid.uuid4(),
        status=EventStatus.APPROVED,
        created_at=datetime.now(timezone.utc)
    )
    
    # Reported 80 instead of 100
    extracted = {
        "quantity": "80"
    }
    
    v = engine._compute_quantity_variance(event, activity, extracted)
    
    assert v is not None
    assert v.variance_type == VarianceType.QUANTITY
    assert v.severity == SeverityLevel.WARNING # 20% diff
    assert v.quantity_delta == -20.0
    assert v.details["direction"] == "under"
