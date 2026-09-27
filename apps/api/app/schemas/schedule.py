from pydantic import BaseModel, ConfigDict
from typing import Optional, List
import uuid
from datetime import datetime
from app.models.schedule import ScheduleStatus, DependencyType


class ScheduleBase(BaseModel):
    name: str

class ScheduleCreate(ScheduleBase):
    project_id: uuid.UUID

class ScheduleResponse(ScheduleBase):
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScheduleVersionBase(BaseModel):
    version_num: int
    status: ScheduleStatus

class ScheduleVersionResponse(ScheduleVersionBase):
    id: uuid.UUID
    schedule_id: uuid.UUID
    source_file_name: Optional[str]
    imported_by_id: Optional[uuid.UUID]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActivityBase(BaseModel):
    activity_code: str
    name: str
    wbs_level: Optional[str] = None
    discipline: Optional[str] = None
    location: Optional[str] = None
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None

class ActivityResponse(ActivityBase):
    id: uuid.UUID
    schedule_version_id: uuid.UUID
    parent_id: Optional[uuid.UUID] = None

    model_config = ConfigDict(from_attributes=True)


class ActivityDependencyResponse(BaseModel):
    id: uuid.UUID
    predecessor_id: uuid.UUID
    successor_id: uuid.UUID
    dependency_type: DependencyType
    lag: float

    model_config = ConfigDict(from_attributes=True)
