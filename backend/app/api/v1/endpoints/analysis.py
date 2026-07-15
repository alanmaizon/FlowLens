"""Analysis report endpoints."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DatabaseSession
from app.core.config import get_settings
from app.schemas.analysis import AnalysisRunResponse
from app.services.analysis_service import AnalysisInputError, AnalysisService
from app.services.anthropic_messages import (
    AIConfigurationError,
    AIProviderError,
    ClaudeMessagesGateway,
)
from app.services.project_service import ProjectNotFoundError, ProjectService

router = APIRouter(prefix="/projects")


def _ensure_project(session: DatabaseSession, user: CurrentUser, project_id: UUID) -> None:
    """Ensure the requested project exists in the caller's workspace."""
    try:
        ProjectService(session).get(user, project_id)
    except ProjectNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        ) from error


def _analysis_service(session: DatabaseSession, with_gateway: bool = False) -> AnalysisService:
    """Compose the use case and provider adapter only when an AI endpoint is used."""
    settings = get_settings()
    gateway = ClaudeMessagesGateway(settings) if with_gateway else None
    return AnalysisService(session, settings, gateway)


@router.post("/{project_id}/analysis", response_model=AnalysisRunResponse)
def generate_analysis(
    project_id: UUID, session: DatabaseSession, user: CurrentUser
) -> AnalysisRunResponse:
    """Generate and persist a structured process-analysis report."""
    _ensure_project(session, user, project_id)
    try:
        return _analysis_service(session, with_gateway=True).generate(project_id)
    except AnalysisInputError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)
        ) from error
    except AIConfigurationError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AI analysis is not configured"
        ) from error
    except AIProviderError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="AI analysis provider request failed"
        ) from error


@router.get("/{project_id}/report", response_model=AnalysisRunResponse | None)
def get_latest_report(
    project_id: UUID, session: DatabaseSession, user: CurrentUser
) -> AnalysisRunResponse | None:
    """Retrieve the latest completed structured analysis report."""
    _ensure_project(session, user, project_id)
    return _analysis_service(session).latest(project_id)
