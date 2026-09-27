import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime, Enum as SQLEnum, Float, Integer, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
import enum

from app.db.session import Base

class ScheduleStatus(enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"

class DependencyType(enum.Enum):
    FS = "FS"
    SS = "SS"
    FF = "FF"
    SF = "SF"

class Schedule(Base):
    __tablename__ = "schedules"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    project = relationship("Project", backref="schedules")
    versions = relationship("ScheduleVersion", back_populates="schedule", cascade="all, delete-orphan")


class ScheduleVersion(Base):
    __tablename__ = "schedule_versions"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    schedule_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("schedules.id", ondelete="CASCADE"), nullable=False, index=True)
    version_num: Mapped[int] = mapped_column(Integer, nullable=False)
    source_file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    imported_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[ScheduleStatus] = mapped_column(SQLEnum(ScheduleStatus, name="schedulestatus"), server_default="DRAFT", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint('schedule_id', 'version_num', name='uq_schedule_version'),
    )

    schedule = relationship("Schedule", back_populates="versions")
    imported_by = relationship("User")
    activities = relationship("Activity", back_populates="schedule_version", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    schedule_version_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("schedule_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    activity_code: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    
    wbs_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    discipline: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    planned_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    planned_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    quantity: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    unit: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("activities.id", ondelete="CASCADE"), nullable=True)
    
    # Vector embeddings for semantic search
    embedding: Mapped[Optional[list[float]]] = mapped_column(Vector(1536), nullable=True)

    __table_args__ = (
        UniqueConstraint('schedule_version_id', 'activity_code', name='uq_version_activity_code'),
    )

    schedule_version = relationship("ScheduleVersion", back_populates="activities")
    parent = relationship("Activity", remote_side=[id], backref="children")

    # Dependencies relationships
    successors = relationship(
        "ActivityDependency",
        foreign_keys="ActivityDependency.predecessor_id",
        back_populates="predecessor",
        cascade="all, delete-orphan"
    )
    predecessors = relationship(
        "ActivityDependency",
        foreign_keys="ActivityDependency.successor_id",
        back_populates="successor",
        cascade="all, delete-orphan"
    )


class ActivityDependency(Base):
    __tablename__ = "activity_dependencies"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    predecessor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True)
    successor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True)
    
    dependency_type: Mapped[DependencyType] = mapped_column(SQLEnum(DependencyType, name="dependencytype"), server_default="FS", nullable=False)
    lag: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    __table_args__ = (
        UniqueConstraint('predecessor_id', 'successor_id', name='uq_activity_dependency'),
    )

    predecessor = relationship("Activity", foreign_keys=[predecessor_id], back_populates="successors")
    successor = relationship("Activity", foreign_keys=[successor_id], back_populates="predecessors")
