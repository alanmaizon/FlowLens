"""Interfaces that isolate analysis use cases from Claude and orchestration choices."""

from typing import Protocol

from app.schemas.analysis import (
    ExecutiveSummary,
    OpportunityAnalysis,
    ProcessAnalysis,
    Roadmap,
    SourceDocument,
)


class ProcessAnalysisService(Protocol):
    """Extract a structured process view from normalised source material."""

    def analyse(self, sources: list[SourceDocument]) -> ProcessAnalysis: ...


class ExecutiveSummaryService(Protocol):
    """Turn detailed process analysis into a concise executive narrative."""

    def summarise(self, analysis: ProcessAnalysis) -> ExecutiveSummary: ...


class OpportunityAnalysisService(Protocol):
    """Identify, score, and describe transformation opportunities."""

    def identify(self, analysis: ProcessAnalysis) -> OpportunityAnalysis: ...


class RoadmapService(Protocol):
    """Sequence approved opportunities into an implementation roadmap."""

    def build(self, opportunities: OpportunityAnalysis) -> Roadmap: ...
