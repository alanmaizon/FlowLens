"""Claude implementations for the independent FlowLens analysis services."""

import json

from app.prompts.executive_summary import EXECUTIVE_SUMMARY_INSTRUCTIONS
from app.prompts.opportunity_analysis import OPPORTUNITY_ANALYSIS_INSTRUCTIONS
from app.prompts.process_analysis import PROCESS_ANALYSIS_INSTRUCTIONS
from app.prompts.roadmap import ROADMAP_INSTRUCTIONS
from app.schemas.analysis import (
    ExecutiveSummary,
    OpportunityAnalysis,
    ProcessAnalysis,
    Roadmap,
    SourceDocument,
)
from app.services.anthropic_messages import ClaudeMessagesGateway


class ClaudeProcessAnalysisService:
    """Extract a current-state process model from normalised source documents."""

    def __init__(self, gateway: ClaudeMessagesGateway) -> None:
        self.gateway = gateway

    def analyse(self, sources: list[SourceDocument]) -> ProcessAnalysis:
        evidence = "\n\n".join(f"## Source: {source.filename}\n{source.text}" for source in sources)
        return self.gateway.parse(ProcessAnalysis, PROCESS_ANALYSIS_INSTRUCTIONS, evidence)


class ClaudeExecutiveSummaryService:
    """Create an executive summary from the already structured process model."""

    def __init__(self, gateway: ClaudeMessagesGateway) -> None:
        self.gateway = gateway

    def summarise(self, analysis: ProcessAnalysis) -> ExecutiveSummary:
        return self.gateway.parse(
            ExecutiveSummary,
            EXECUTIVE_SUMMARY_INSTRUCTIONS,
            json.dumps(analysis.model_dump(mode="json")),
        )


class ClaudeOpportunityAnalysisService:
    """Generate prioritised AI and automation opportunities from process evidence."""

    def __init__(self, gateway: ClaudeMessagesGateway) -> None:
        self.gateway = gateway

    def identify(self, analysis: ProcessAnalysis) -> OpportunityAnalysis:
        return self.gateway.parse(
            OpportunityAnalysis,
            OPPORTUNITY_ANALYSIS_INSTRUCTIONS,
            json.dumps(analysis.model_dump(mode="json")),
        )


class ClaudeRoadmapService:
    """Sequence recommendations into a delivery roadmap."""

    def __init__(self, gateway: ClaudeMessagesGateway) -> None:
        self.gateway = gateway

    def build(self, opportunities: OpportunityAnalysis) -> Roadmap:
        return self.gateway.parse(
            Roadmap,
            ROADMAP_INSTRUCTIONS,
            json.dumps(opportunities.model_dump(mode="json")),
        )
