"""
NEXUS API — Audit logging service.
Centralizes audit trail creation so every state change is traceable.
"""
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog


async def write_audit_log(
    db: AsyncSession,
    *,
    actor_id: Optional[UUID],
    entity_type: str,
    entity_id: UUID,
    action: str,
    before_state: Optional[dict] = None,
    after_state: Optional[dict] = None,
    reason: Optional[str] = None,
    request_id: Optional[str] = None,
) -> AuditLog:
    """Write an immutable audit log entry."""
    entry = AuditLog(
        actor_id=actor_id,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        before_state=before_state,
        after_state=after_state,
        reason=reason,
        request_id=request_id,
    )
    db.add(entry)
    await db.flush()
    return entry
