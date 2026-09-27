"""
NEXUS API — Pydantic schemas for Users and Roles.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


# ── Role ───────────────────────────────────────────────

class RoleOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


# ── User ───────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role_names: list[str]  # e.g. ["ADMIN", "PLANNER"]


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role_names: Optional[list[str]] = None


class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    is_active: bool
    roles: list[RoleOut]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserMe(BaseModel):
    """Returned by /auth/me — includes role names for easy frontend use."""
    id: UUID
    email: str
    full_name: str
    roles: list[str]

    model_config = {"from_attributes": True}
