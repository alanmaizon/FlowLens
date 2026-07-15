"""Health-check response contract."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Stable health response returned to orchestration platforms."""

    status: Literal["ok"]
    timestamp: datetime
    database: Literal["ok"] | None = None
