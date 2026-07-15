"""Project conversation persistence queries."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage
from app.repositories.base import BaseRepository


class ChatMessageRepository(BaseRepository[ChatMessage]):
    """Persistence gateway for project conversation turns."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, ChatMessage)

    def list_recent(self, project_id: UUID, limit: int = 12) -> list[ChatMessage]:
        """Return chronologically ordered recent history bounded for model context."""
        statement = (
            select(ChatMessage)
            .where(ChatMessage.project_id == project_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
        )
        return list(reversed(list(self.session.scalars(statement))))

    def list_all(self, project_id: UUID) -> list[ChatMessage]:
        """Return a project's full conversation for the authenticated workspace user."""
        statement = (
            select(ChatMessage)
            .where(ChatMessage.project_id == project_id)
            .order_by(ChatMessage.created_at.asc())
        )
        return list(self.session.scalars(statement))
