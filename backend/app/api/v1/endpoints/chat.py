"""Project-context conversation endpoints."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DatabaseSession
from app.core.config import get_settings
from app.models.project import Project
from app.schemas.chat import ChatMessageResponse, ChatRequest
from app.services.anthropic_messages import (
    AIConfigurationError,
    AIProviderError,
    ClaudeMessagesGateway,
)
from app.services.chat_service import ProjectChatService
from app.services.project_service import ProjectNotFoundError, ProjectService

router = APIRouter(prefix="/projects")


def _project_or_404(session: DatabaseSession, user: CurrentUser, project_id: UUID) -> Project:
    """Resolve a project inside the requesting user's workspace."""
    try:
        return ProjectService(session).get(user, project_id)
    except ProjectNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        ) from error


def _chat_service(session: DatabaseSession, with_gateway: bool = False) -> ProjectChatService:
    """Compose chat persistence and the provider gateway on demand."""
    settings = get_settings()
    gateway = ClaudeMessagesGateway(settings) if with_gateway else None
    return ProjectChatService(session, gateway)


@router.get("/{project_id}/chat", response_model=list[ChatMessageResponse])
def list_chat_messages(
    project_id: UUID, session: DatabaseSession, user: CurrentUser
) -> list[ChatMessageResponse]:
    """Return the authenticated user's persisted project conversation."""
    _project_or_404(session, user, project_id)
    return _chat_service(session).list_messages(project_id)


@router.post("/{project_id}/chat", response_model=list[ChatMessageResponse])
def send_chat_message(
    project_id: UUID, payload: ChatRequest, session: DatabaseSession, user: CurrentUser
) -> list[ChatMessageResponse]:
    """Ask FlowLens a question using the project's sources, report, and recent history."""
    project = _project_or_404(session, user, project_id)
    try:
        return _chat_service(session, with_gateway=True).ask(project, payload.message)
    except AIConfigurationError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Project chat is not configured"
        ) from error
    except AIProviderError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="Project chat provider request failed"
        ) from error
