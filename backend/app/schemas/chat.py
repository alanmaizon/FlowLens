"""Project-chat request and response contracts."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """A project-context question submitted by the user."""

    message: str = Field(min_length=1, max_length=8_000)


class ChatMessageResponse(BaseModel):
    """A persisted conversation turn."""

    id: UUID
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
