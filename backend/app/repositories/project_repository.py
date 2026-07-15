"""Project persistence queries."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.repositories.base import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    """Persistence gateway for project-scoped operations."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, Project)

    def list_for_owner(self, owner_id: UUID) -> list[Project]:
        """Return a user's projects in most-recently-updated order."""
        statement = (
            select(Project).where(Project.owner_id == owner_id).order_by(Project.updated_at.desc())
        )
        return list(self.session.scalars(statement))

    def get_for_owner(self, project_id: UUID, owner_id: UUID) -> Project | None:
        """Fetch a project only when it belongs to the authenticated user."""
        statement = select(Project).where(Project.id == project_id, Project.owner_id == owner_id)
        return self.session.scalar(statement)
