"""Orchestrate independent analysis services into a complete project report."""

from app.schemas.analysis import ProjectReport, SourceDocument
from app.services.analysis.claude_services import (
    ClaudeExecutiveSummaryService,
    ClaudeOpportunityAnalysisService,
    ClaudeProcessAnalysisService,
    ClaudeRoadmapService,
)
from app.services.anthropic_messages import ClaudeMessagesGateway


class ProjectAnalysisOrchestrator:
    """Compose focused analysis services without exposing provider calls to API routes."""

    def __init__(self, gateway: ClaudeMessagesGateway) -> None:
        self.process_analysis = ClaudeProcessAnalysisService(gateway)
        self.executive_summary = ClaudeExecutiveSummaryService(gateway)
        self.opportunity_analysis = ClaudeOpportunityAnalysisService(gateway)
        self.roadmap = ClaudeRoadmapService(gateway)

    def generate(self, sources: list[SourceDocument]) -> ProjectReport:
        """Generate a coherent report through independently replaceable service boundaries."""
        process_analysis = self.process_analysis.analyse(sources)
        executive_summary = self.executive_summary.summarise(process_analysis)
        opportunity_analysis = self.opportunity_analysis.identify(process_analysis)
        roadmap = self.roadmap.build(opportunity_analysis)
        return ProjectReport(
            executive_summary=executive_summary,
            process_analysis=process_analysis,
            opportunity_analysis=opportunity_analysis,
            roadmap=roadmap,
        )
