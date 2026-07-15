"""Document persistence queries."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    """Persistence gateway for a project's source documents."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, Document)

    def list_for_project(self, project_id: UUID) -> list[Document]:
        """Return source material ordered by most recent upload."""
        statement = (
            select(Document)
            .where(Document.project_id == project_id)
            .order_by(Document.created_at.desc())
        )
        return list(self.session.scalars(statement))

    def get_for_project(self, document_id: UUID, project_id: UUID) -> Document | None:
        """Fetch a document only inside the requested project boundary."""
        statement = select(Document).where(
            Document.id == document_id, Document.project_id == project_id
        )
        return self.session.scalar(statement)
