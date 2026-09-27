"""
NEXUS API — Pydantic schemas for Projects.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    location: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


class ProjectMemberAdd(BaseModel):
    user_id: UUID
    role: str  # Role within the project context


class ProjectMemberOut(BaseModel):
    id: UUID
    user_id: UUID
    user_name: str
    user_email: str
    role: str
    assigned_at: datetime

    model_config = {"from_attributes": True}


class ProjectOut(BaseModel):
    id: UUID
    name: str
    code: str
    description: Optional[str] = None
    location: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    member_count: int = 0

    model_config = {"from_attributes": True}


class ProjectDetailOut(ProjectOut):
    members: list[ProjectMemberOut] = []
