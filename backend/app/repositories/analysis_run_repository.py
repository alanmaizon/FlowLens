"""Analysis-run persistence queries."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analysis_run import AnalysisRun, AnalysisRunStatus
from app.repositories.base import BaseRepository


class AnalysisRunRepository(BaseRepository[AnalysisRun]):
    """Persistence gateway for generated project reports."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, AnalysisRun)

    def get_latest_completed(self, project_id: UUID) -> AnalysisRun | None:
        """Return the latest completed report, if project analysis has run."""
        statement = (
            select(AnalysisRun)
            .where(
                AnalysisRun.project_id == project_id,
                AnalysisRun.status == AnalysisRunStatus.COMPLETED,
            )
            .order_by(AnalysisRun.created_at.desc())
            .limit(1)
        )
        return self.session.scalar(statement)
