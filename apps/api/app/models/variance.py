import uuid
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Enum, ForeignKey, Text, Float, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.session import Base


class VarianceType(str, enum.Enum):
    SCHEDULE = "SCHEDULE"        # Time-based deviation
    QUANTITY = "QUANTITY"         # Quantity-based deviation
    SEQUENCE = "SEQUENCE"        # Out-of-order execution


class SeverityLevel(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class Variance(Base):
    __tablename__ = "variances"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    event_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("execution_events.id", ondelete="CASCADE"), index=True)
    activity_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("activities.id", ondelete="SET NULL"), nullable=True)

    variance_type: Mapped[VarianceType] = mapped_column(Enum(VarianceType), index=True)
    severity: Mapped[SeverityLevel] = mapped_column(Enum(SeverityLevel), server_default="INFO")

    # Schedule variance metrics
    planned_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    planned_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    actual_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    delta_days: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Quantity variance metrics
    planned_quantity: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    actual_quantity: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    quantity_delta: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Human-readable summary
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    details: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    event = relationship("ExecutionEvent", backref="variances")
    activity = relationship("Activity", backref="variances")
