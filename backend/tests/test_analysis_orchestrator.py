from types import SimpleNamespace

from app.core.config import Settings
from app.schemas.analysis import (
    Actor,
    BusinessSystem,
    ExecutiveSummary,
    Opportunity,
    OpportunityAnalysis,
    PainPoint,
    ProcessAnalysis,
    ProcessStep,
    Risk,
    Roadmap,
    RoadmapPhase,
    SourceDocument,
)
from app.services.analysis.orchestrator import ProjectAnalysisOrchestrator
from app.services.anthropic_messages import ClaudeMessagesGateway


class FakeMessages:
    def __init__(self, parsed_results: list[object]) -> None:
        self.parsed_results = parsed_results
        self.schemas: list[type[object]] = []

    def parse(self, *, output_format: type[object], **_: object) -> SimpleNamespace:
        self.schemas.append(output_format)
        return SimpleNamespace(parsed_output=self.parsed_results.pop(0))


class FakeClient:
    def __init__(self, parsed_results: list[object]) -> None:
        self.messages = FakeMessages(parsed_results)


def test_analysis_orchestrator_composes_independent_structured_services() -> None:
    analysis = ProcessAnalysis(
        process_name="Invoice intake",
        overview="Invoices arrive by email and are entered manually.",
        process_steps=[
            ProcessStep(
                name="Receive invoice",
                description="AP receives an invoice inbox email.",
                primary_actor="AP analyst",
                systems=[],
            )
        ],
        actors=[Actor(name="AP analyst", responsibilities=["Validate invoices"])],
        systems=[BusinessSystem(name="ERP", role="Record invoice")],
        pain_points=[PainPoint(title="Manual entry", description="Repeated keying", impact="high")],
        risks=[Risk(title="Data error", description="Entry may be wrong", severity="medium")],
    )
    summary = ExecutiveSummary(
        headline="Manual intake delays payment processing.",
        summary="The intake process relies on manual ERP entry.",
        key_findings=["Manual rekeying is the central bottleneck."],
    )
    opportunities = OpportunityAnalysis(
        opportunities=[
            Opportunity(
                title="Invoice extraction",
                category="ai",
                description="Extract invoice fields before review.",
                expected_impact="Less data entry",
                priority="high",
                effort="medium",
                user_stories=[],
            )
        ],
        prioritized_recommendations=["Pilot invoice extraction."],
    )
    roadmap = Roadmap(
        phases=[
            RoadmapPhase(
                name="Pilot",
                timeframe="0–6 weeks",
                objectives=["Validate extraction accuracy"],
                recommendations=["Pilot invoice extraction."],
            )
        ]
    )
    client = FakeClient([analysis, summary, opportunities, roadmap])
    gateway = ClaudeMessagesGateway(Settings(anthropic_api_key="test-key"), client=client)

    report = ProjectAnalysisOrchestrator(gateway).generate(
        [SourceDocument(document_id="1", filename="notes.txt", text="Invoices arrive by email.")]
    )

    assert report.executive_summary == summary
    assert report.process_analysis.process_name == "Invoice intake"
    assert report.opportunity_analysis.opportunities[0].title == "Invoice extraction"
    assert report.roadmap.phases[0].name == "Pilot"
    assert len(client.messages.schemas) == 4
