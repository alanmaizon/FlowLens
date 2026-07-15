"""Project and document API contracts."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class ProjectCreateRequest(BaseModel):
    """Payload for creating a process-analysis workspace."""

    name: str = Field(min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=10_000)


class DocumentResponse(BaseModel):
    """Metadata for an uploaded source document."""

    id: UUID
    project_id: UUID
    filename: str
    content_type: str
    size_bytes: int
    status: Literal["uploaded", "processing", "ready", "failed"]
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectResponse(BaseModel):
    """Project card data."""

    id: UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime
    document_count: int = 0

    model_config = {"from_attributes": True}


class ProjectDetailResponse(ProjectResponse):
    """Project data with its accessible source documents."""

    documents: list[DocumentResponse] = Field(default_factory=list)
