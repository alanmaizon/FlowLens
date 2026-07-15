"""Structured, provider-neutral contracts for the analysis pipeline and report UI."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class SourceDocument(BaseModel):
    """Normalised source material made available to the process-analysis service."""

    document_id: str
    filename: str
    text: str


class ProcessStep(BaseModel):
    """One observable step in the current-state process map."""

    name: str
    description: str
    primary_actor: str
    systems: list[str]


class Actor(BaseModel):
    """A person, team, or external party involved in the process."""

    name: str
    responsibilities: list[str]


class BusinessSystem(BaseModel):
    """A system or tool used while executing the process."""

    name: str
    role: str


class PainPoint(BaseModel):
    """A friction point evidenced in the provided material."""

    title: str
    description: str
    impact: Literal["low", "medium", "high"]


class Risk(BaseModel):
    """An operational, compliance, financial, or customer risk."""

    title: str
    description: str
    severity: Literal["low", "medium", "high"]


class ProcessAnalysis(BaseModel):
    """Structured current-state discovery output."""

    process_name: str
    overview: str
    process_steps: list[ProcessStep]
    actors: list[Actor]
    systems: list[BusinessSystem]
    pain_points: list[PainPoint]
    risks: list[Risk]


class ExecutiveSummary(BaseModel):
    """Audience-ready summary of the process and its key concerns."""

    headline: str
    summary: str
    key_findings: list[str]


class UserStory(BaseModel):
    """A delivery-ready user story grounded in a selected opportunity."""

    title: str
    story: str
    acceptance_criteria: list[str]


class Opportunity(BaseModel):
    """A candidate AI or automation transformation opportunity."""

    title: str
    category: Literal["ai", "automation"]
    description: str
    expected_impact: str
    priority: Literal["low", "medium", "high"]
    effort: Literal["low", "medium", "high"]
    user_stories: list[UserStory]


class OpportunityAnalysis(BaseModel):
    """Prioritised transformation recommendations."""

    opportunities: list[Opportunity]
    prioritized_recommendations: list[str]


class RoadmapPhase(BaseModel):
    """A practical delivery phase."""

    name: str
    timeframe: str
    objectives: list[str]
    recommendations: list[str]


class Roadmap(BaseModel):
    """Sequenced implementation view for approved opportunities."""

    phases: list[RoadmapPhase]


class ProjectReport(BaseModel):
    """The complete report assembled from independently generated analysis components."""

    executive_summary: ExecutiveSummary
    process_analysis: ProcessAnalysis
    opportunity_analysis: OpportunityAnalysis
    roadmap: Roadmap


class AnalysisRunResponse(BaseModel):
    """Persisted analysis run returned by report endpoints."""

    id: UUID
    project_id: UUID
    status: Literal["processing", "completed", "failed"]
    model_name: str
    report: ProjectReport | None = None
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
