"""Persisted structured analysis runs for a project."""

from __future__ import annotations

from enum import StrEnum
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from sqlalchemy import JSON, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project


class AnalysisRunStatus(StrEnum):
    """Lifecycle states for an analysis job."""

    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisRun(TimestampMixin, Base):
    """A versioned report generated from a project's document set."""

    __tablename__ = "analysis_runs"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    status: Mapped[AnalysisRunStatus] = mapped_column(
        Enum(AnalysisRunStatus, name="analysis_run_status"), default=AnalysisRunStatus.PROCESSING
    )
    model_name: Mapped[str] = mapped_column(String(100))
    report: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    error_message: Mapped[str | None] = mapped_column(Text)
    project: Mapped[Project] = relationship(back_populates="analysis_runs")
