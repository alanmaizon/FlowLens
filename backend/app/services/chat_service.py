"""Project-context chat use case backed by the Claude Messages API."""

import json
from uuid import UUID

from anthropic.types import MessageParam
from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage, ChatMessageRole
from app.models.project import Project
from app.prompts.project_chat import PROJECT_CHAT_INSTRUCTIONS
from app.repositories.analysis_run_repository import AnalysisRunRepository
from app.repositories.chat_message_repository import ChatMessageRepository
from app.repositories.document_repository import DocumentRepository
from app.schemas.analysis import ProjectReport
from app.schemas.chat import ChatMessageResponse
from app.services.anthropic_messages import AIConfigurationError, ClaudeMessagesGateway


class ProjectChatService:
    """Answer questions with explicit project evidence and persisted conversation context."""

    def __init__(self, session: Session, gateway: ClaudeMessagesGateway | None = None) -> None:
        self.session = session
        self.gateway = gateway
        self.messages = ChatMessageRepository(session)
        self.documents = DocumentRepository(session)
        self.analysis_runs = AnalysisRunRepository(session)

    def list_messages(self, project_id: UUID) -> list[ChatMessageResponse]:
        """Return all persisted project chat turns in chronological order."""
        return [
            ChatMessageResponse.model_validate(message)
            for message in self.messages.list_all(project_id)
        ]

    def ask(self, project: Project, message: str) -> list[ChatMessageResponse]:
        """Persist a question and its Claude answer as a single conversation update."""
        history = self.messages.list_recent(project.id)
        if self.gateway is None:
            raise AIConfigurationError("ANTHROPIC_API_KEY is not configured")
        chat_messages: list[MessageParam] = []
        for prior in history:
            chat_messages.append(
                {
                    "role": "user" if prior.role == ChatMessageRole.USER else "assistant",
                    "content": prior.content,
                }
            )
        chat_messages.append({"role": "user", "content": message.strip()})
        instructions = (
            f"{PROJECT_CHAT_INSTRUCTIONS}\n\n"
            f"<Project context>\n{self._context(project)}\n</Project context>"
        )
        answer, response_id = self.gateway.respond(instructions, chat_messages)

        user_turn = ChatMessage(
            project_id=project.id,
            role=ChatMessageRole.USER,
            content=message.strip(),
            provider_response_id=None,
        )
        assistant_turn = ChatMessage(
            project_id=project.id,
            role=ChatMessageRole.ASSISTANT,
            content=answer,
            provider_response_id=response_id,
        )
        self.messages.add(user_turn)
        self.messages.add(assistant_turn)
        self.session.commit()
        self.session.refresh(user_turn)
        self.session.refresh(assistant_turn)
        return [
            ChatMessageResponse.model_validate(user_turn),
            ChatMessageResponse.model_validate(assistant_turn),
        ]

    def _context(self, project: Project) -> str:
        """Build bounded, explicit project evidence for each chat request."""
        context: dict[str, object] = {
            "project": {"name": project.name, "description": project.description},
        }
        latest_report = self.analysis_runs.get_latest_completed(project.id)
        if latest_report and latest_report.report:
            context["analysis_report"] = ProjectReport.model_validate(
                latest_report.report
            ).model_dump(mode="json")

        excerpts: list[dict[str, str]] = []
        remaining = 12_000
        for document in self.documents.list_for_project(project.id):
            if not document.extracted_text or remaining <= 0:
                continue
            excerpt = document.extracted_text[: min(3_000, remaining)]
            excerpts.append({"filename": document.filename, "excerpt": excerpt})
            remaining -= len(excerpt)
        context["source_excerpts"] = excerpts
        return json.dumps(context, ensure_ascii=False)
