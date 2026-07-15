"""Project-scoped chat history."""

from __future__ import annotations

from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project


class ChatMessageRole(StrEnum):
    """Roles persisted for a project conversation."""

    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(TimestampMixin, Base):
    """One user or assistant turn in a project's contextual conversation."""

    __tablename__ = "chat_messages"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[ChatMessageRole] = mapped_column(Enum(ChatMessageRole, name="chat_message_role"))
    content: Mapped[str] = mapped_column(Text)
    provider_response_id: Mapped[str | None] = mapped_column(String(255))
    project: Mapped[Project] = relationship(back_populates="chat_messages")
