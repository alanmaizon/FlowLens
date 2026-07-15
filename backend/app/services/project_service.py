"""Project use cases with ownership validation kept outside routes."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.user import User
from app.repositories.document_repository import DocumentRepository
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreateRequest, ProjectDetailResponse, ProjectResponse


class ProjectNotFoundError(Exception):
    """Raised when an authenticated user cannot access a requested project."""


class ProjectService:
    """Own project creation, listing, and user-scoped retrieval."""

    def __init__(self, session: Session) -> None:
        self.session = session
        self.projects = ProjectRepository(session)
        self.documents = DocumentRepository(session)

    def create(self, owner: User, payload: ProjectCreateRequest) -> ProjectResponse:
        """Create a process-analysis workspace for the signed-in user."""
        project = Project(
            name=payload.name.strip(),
            description=payload.description.strip() if payload.description else None,
            owner_id=owner.id,
        )
        self.projects.add(project)
        self.session.commit()
        self.session.refresh(project)
        return self._as_response(project, 0)

    def list(self, owner: User) -> list[ProjectResponse]:
        """List the signed-in user's project cards."""
        projects = self.projects.list_for_owner(owner.id)
        return [self._as_response(project, len(project.documents)) for project in projects]

    def get(self, owner: User, project_id: UUID) -> Project:
        """Get a project only if it is scoped to the signed-in user."""
        project = self.projects.get_for_owner(project_id, owner.id)
        if project is None:
            raise ProjectNotFoundError
        return project

    def detail(self, owner: User, project_id: UUID) -> ProjectDetailResponse:
        """Build a project detail response with ordered document metadata."""
        project = self.get(owner, project_id)
        documents = self.documents.list_for_project(project.id)
        return ProjectDetailResponse(
            **self._as_response(project, len(documents)).model_dump(),
            documents=documents,
        )

    @staticmethod
    def _as_response(project: Project, document_count: int) -> ProjectResponse:
        return ProjectResponse.model_validate(project).model_copy(
            update={"document_count": document_count}
        )
