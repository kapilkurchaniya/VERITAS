import uuid
import enum
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, DateTime, Enum, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.session import Base

class EventStatus(str, enum.Enum):
    PENDING_PROCESSING = "PENDING_PROCESSING"
    EXTRACTED = "EXTRACTED"
    MATCHED = "MATCHED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    FAILED = "FAILED"

class SourceType(str, enum.Enum):
    TEXT = "TEXT"
    AUDIO = "AUDIO"
    IMAGE = "IMAGE"
    PDF = "PDF"
    EXCEL = "EXCEL"

class ExecutionEvent(Base):
    __tablename__ = "execution_events"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    reported_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Capture Info
    source_type: Mapped[SourceType] = mapped_column(Enum(SourceType), server_default="TEXT")
    raw_input: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # State tracking
    status: Mapped[EventStatus] = mapped_column(Enum(EventStatus), server_default="PENDING_PROCESSING", index=True)
    
    # Extracted fields (populated later by AI pipeline)
    extracted_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    normalized_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Matching (populated later by Match engine)
    matched_activity_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("activities.id", ondelete="SET NULL"), nullable=True)
    
    # Audit
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    evidence: Mapped[List["Evidence"]] = relationship("Evidence", secondary="event_evidence", back_populates="events")

class Evidence(Base):
    __tablename__ = "evidence"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    uploaded_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    file_name: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(1024))
    file_type: Mapped[str] = mapped_column(String(50))
    file_size: Mapped[int] = mapped_column()
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    events: Mapped[List["ExecutionEvent"]] = relationship("ExecutionEvent", secondary="event_evidence", back_populates="evidence")

class EventEvidence(Base):
    __tablename__ = "event_evidence"

    event_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("execution_events.id", ondelete="CASCADE"), primary_key=True)
    evidence_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("evidence.id", ondelete="CASCADE"), primary_key=True)
