import uuid
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.execution import EventStatus, SourceType


class EvidenceBase(BaseModel):
    file_name: str
    file_type: str
    file_size: int

class EvidenceResponse(EvidenceBase):
    id: uuid.UUID
    project_id: uuid.UUID
    uploaded_by_id: Optional[uuid.UUID]
    file_path: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExecutionEventBase(BaseModel):
    project_id: uuid.UUID
    source_type: SourceType
    raw_input: Optional[str] = None

class ExecutionEventCreate(ExecutionEventBase):
    pass

class ExecutionEventResponse(ExecutionEventBase):
    id: uuid.UUID
    reported_by_id: Optional[uuid.UUID]
    status: EventStatus
    extracted_data: Optional[Any] = None
    normalized_text: Optional[str] = None
    matched_activity_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    
    evidence: List[EvidenceResponse] = []

    model_config = ConfigDict(from_attributes=True)
