"""Thin Claude Messages API gateway shared by independent application services."""

from typing import Any, TypeVar

from anthropic import Anthropic, APIError
from anthropic.types import MessageParam, TextBlock
from pydantic import BaseModel

from app.core.config import Settings

StructuredModelT = TypeVar("StructuredModelT", bound=BaseModel)


class AIConfigurationError(Exception):
    """Raised when an AI route is invoked without configured credentials."""


class AIProviderError(Exception):
    """Raised when the model provider cannot produce a usable response."""


class ClaudeMessagesGateway:
    """Keep Claude SDK calls out of analysis and project-chat use cases."""

    def __init__(self, settings: Settings, client: Any | None = None) -> None:
        api_key = (
            settings.anthropic_api_key.get_secret_value() if settings.anthropic_api_key else None
        )
        if client is None and not api_key:
            raise AIConfigurationError("ANTHROPIC_API_KEY is not configured")
        self.client = client or Anthropic(api_key=api_key)
        self.model = settings.anthropic_model
        self.chat_model = settings.chat_model
        self.analysis_max_output_tokens = settings.anthropic_analysis_max_output_tokens
        self.chat_max_output_tokens = settings.anthropic_chat_max_output_tokens

    def parse(
        self, schema: type[StructuredModelT], instructions: str, user_input: str
    ) -> StructuredModelT:
        """Generate a Pydantic-validated Structured Output with Claude."""
        try:
            response = self.client.messages.parse(
                model=self.model,
                max_tokens=self.analysis_max_output_tokens,
                system=instructions,
                messages=[{"role": "user", "content": user_input}],
                output_format=schema,
            )
        except APIError as error:
            raise AIProviderError("Claude could not complete the structured analysis") from error

        parsed = response.parsed_output
        if not isinstance(parsed, schema):
            raise AIProviderError("Claude did not return the expected structured result")
        return parsed

    def respond(self, instructions: str, messages: list[MessageParam]) -> tuple[str, str | None]:
        """Generate a text response from project context and recent conversation history."""
        try:
            response = self.client.messages.create(
                model=self.chat_model,
                max_tokens=self.chat_max_output_tokens,
                system=instructions,
                messages=messages,
            )
        except APIError as error:
            raise AIProviderError("Claude could not complete the project chat response") from error

        content = "".join(
            block.text for block in response.content if isinstance(block, TextBlock)
        ).strip()
        if not content:
            raise AIProviderError("Claude returned an empty project chat response")
        return content, getattr(response, "id", None)
