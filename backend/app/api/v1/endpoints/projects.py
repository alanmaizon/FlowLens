"""Project and document HTTP endpoints with thin orchestration only."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from app.api.deps import CurrentUser, DatabaseSession
from app.core.config import get_settings
from app.models.project import Project
from app.schemas.project import (
    DocumentResponse,
    ProjectCreateRequest,
    ProjectDetailResponse,
    ProjectResponse,
)
from app.services.document_service import DocumentService, DocumentUploadError
from app.services.project_service import ProjectNotFoundError, ProjectService

router = APIRouter(prefix="/projects")


def _project_or_404(session: DatabaseSession, user: CurrentUser, project_id: UUID) -> Project:
    """Resolve a project inside the caller's ownership scope."""
    try:
        return ProjectService(session).get(user, project_id)
    except ProjectNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        ) from error


@router.get("", response_model=list[ProjectResponse])
def list_projects(session: DatabaseSession, user: CurrentUser) -> list[ProjectResponse]:
    """List the signed-in user's projects."""
    return ProjectService(session).list(user)


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreateRequest, session: DatabaseSession, user: CurrentUser
) -> ProjectResponse:
    """Create a new process-analysis project."""
    return ProjectService(session).create(user, payload)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(
    project_id: UUID, session: DatabaseSession, user: CurrentUser
) -> ProjectDetailResponse:
    """Get a project and its uploaded document metadata."""
    try:
        return ProjectService(session).detail(user, project_id)
    except ProjectNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        ) from error


@router.post(
    "/{project_id}/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    project_id: UUID,
    session: DatabaseSession,
    user: CurrentUser,
    file: Annotated[UploadFile, File()],
) -> DocumentResponse:
    """Upload supported source material, store it, and extract process text."""
    _project_or_404(session, user, project_id)
    try:
        document = await DocumentService(session, get_settings()).upload(project_id, file)
        return DocumentResponse.model_validate(document)
    except DocumentUploadError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)
        ) from error


@router.get("/{project_id}/documents/{document_id}/download")
def download_document(
    project_id: UUID, document_id: UUID, session: DatabaseSession, user: CurrentUser
) -> FileResponse:
    """Return the original uploaded file to its project owner."""
    _project_or_404(session, user, project_id)
    document = DocumentService(session, get_settings()).documents.get_for_project(
        document_id, project_id
    )
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    storage = DocumentService(session, get_settings()).storage
    try:
        file_path = storage.path_for(document.storage_key)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document storage not found"
        ) from error
    if not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document storage not found"
        )
    return FileResponse(file_path, media_type=document.content_type, filename=document.filename)
