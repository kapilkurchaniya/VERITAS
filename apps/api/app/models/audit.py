"""
NEXUS API — Audit log model.
Every important state change is recorded here with before/after snapshots.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.db.session import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # null for system actions
    entity_type = Column(String(100), nullable=False, index=True)     # "user", "project", "event", etc.
    entity_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    action = Column(String(100), nullable=False, index=True)          # "created", "updated", "approved", etc.
    before_state = Column(JSONB, nullable=True)                       # snapshot before change
    after_state = Column(JSONB, nullable=True)                        # snapshot after change
    reason = Column(Text, nullable=True)                              # human-provided reason
    request_id = Column(String(64), nullable=True, index=True)       # correlates related operations
    timestamp = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
