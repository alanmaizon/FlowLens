"""Persistence-aware project analysis use case."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models.analysis_run import AnalysisRun, AnalysisRunStatus
from app.models.document import DocumentStatus
from app.repositories.analysis_run_repository import AnalysisRunRepository
from app.repositories.document_repository import DocumentRepository
from app.schemas.analysis import AnalysisRunResponse, ProjectReport, SourceDocument
from app.services.analysis.orchestrator import ProjectAnalysisOrchestrator
from app.services.anthropic_messages import AIConfigurationError, ClaudeMessagesGateway


class AnalysisInputError(Exception):
    """Raised when analysis is requested before usable source documents exist."""


class AnalysisService:
    """Persist report versions and delegate generation to the analysis orchestrator."""

    def __init__(
        self, session: Session, settings: Settings, gateway: ClaudeMessagesGateway | None = None
    ) -> None:
        self.session = session
        self.settings = settings
        self.runs = AnalysisRunRepository(session)
        self.documents = DocumentRepository(session)
        self.orchestrator = ProjectAnalysisOrchestrator(gateway) if gateway else None

    def generate(self, project_id: UUID) -> AnalysisRunResponse:
        """Analyse ready project documents and retain the complete structured report."""
        sources = self._sources(project_id)
        if not sources:
            raise AnalysisInputError(
                "Upload at least one readable document before generating analysis"
            )
        if self.orchestrator is None:
            raise AIConfigurationError("ANTHROPIC_API_KEY is not configured")

        run = AnalysisRun(
            project_id=project_id,
            status=AnalysisRunStatus.PROCESSING,
            model_name=self.settings.anthropic_model,
            report=None,
            error_message=None,
        )
        self.runs.add(run)
        self.session.commit()
        self.session.refresh(run)

        try:
            report = self.orchestrator.generate(sources)
        except Exception:
            run.status = AnalysisRunStatus.FAILED
            run.error_message = (
                "Analysis generation failed. Review server logs and provider configuration."
            )
            self.session.commit()
            raise

        run.status = AnalysisRunStatus.COMPLETED
        run.report = report.model_dump(mode="json")
        self.session.commit()
        self.session.refresh(run)
        return self._response(run)

    def latest(self, project_id: UUID) -> AnalysisRunResponse | None:
        """Return the latest completed report, if analysis has been generated."""
        run = self.runs.get_latest_completed(project_id)
        return self._response(run) if run is not None else None

    def _sources(self, project_id: UUID) -> list[SourceDocument]:
        remaining = self.settings.max_document_context_characters
        sources: list[SourceDocument] = []
        for document in self.documents.list_for_project(project_id):
            if (
                document.status != DocumentStatus.READY
                or not document.extracted_text
                or remaining <= 0
            ):
                continue
            text = document.extracted_text[:remaining]
            sources.append(
                SourceDocument(document_id=str(document.id), filename=document.filename, text=text)
            )
            remaining -= len(text)
        return sources

    @staticmethod
    def _response(run: AnalysisRun) -> AnalysisRunResponse:
        report = ProjectReport.model_validate(run.report) if run.report else None
        return AnalysisRunResponse(
            id=run.id,
            project_id=run.project_id,
            status=run.status,
            model_name=run.model_name,
            report=report,
            error_message=run.error_message,
            created_at=run.created_at,
            updated_at=run.updated_at,
        )
