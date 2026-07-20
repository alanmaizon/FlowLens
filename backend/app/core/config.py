"""Typed application configuration sourced from the environment."""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings; secrets must always come from the environment in deployment."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore"
    )

    app_name: str = "FlowLens API"
    app_version: str = "0.1.0"
    environment: Literal["development", "test", "staging", "production"] = "development"
    api_v1_prefix: str = "/api/v1"
    log_level: str = "INFO"
    database_url: str = "postgresql+psycopg://flowlens:flowlens@localhost:5432/flowlens"
    database_pool_size: int = Field(default=5, ge=1, le=50)
    database_max_overflow: int = Field(default=10, ge=0, le=50)
    secret_key: str = "unsafe-development-secret-change-me"
    access_token_expire_minutes: int = Field(default=30, ge=1, le=1440)
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:8080"]

    storage_local_path: Path = Path("data/uploads")
    max_upload_size_bytes: int = Field(default=25 * 1024 * 1024, ge=1)
    max_document_context_characters: int = Field(default=60_000, ge=1_000)

    anthropic_api_key: SecretStr | None = None
    anthropic_model: str = "claude-sonnet-5"
    anthropic_chat_model: str | None = None
    anthropic_analysis_max_output_tokens: int = Field(default=16_384, ge=256, le=128_000)
    anthropic_chat_max_output_tokens: int = Field(default=2_048, ge=128, le=128_000)

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        """Prevent an accidental deployment with the documented development secret."""
        if self.environment in {"staging", "production"} and (
            self.secret_key == "unsafe-development-secret-change-me" or len(self.secret_key) < 32
        ):
            raise ValueError(
                "SECRET_KEY must be a unique value of at least 32 characters outside development"
            )
        return self

    @property
    def chat_model(self) -> str:
        """Use a separately configurable model for interactive project chat."""
        return self.anthropic_chat_model or self.anthropic_model


@lru_cache
def get_settings() -> Settings:
    """Return the singleton settings object for the current process."""
    return Settings()
