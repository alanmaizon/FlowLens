"""JWT primitives kept separate from HTTP authentication dependencies."""

from datetime import UTC, datetime, timedelta
from typing import Any

import jwt

from app.core.config import Settings

ALGORITHM = "HS256"


def create_access_token(
    subject: str, settings: Settings, extra_claims: dict[str, Any] | None = None
) -> str:
    """Create a short-lived JWT for an authenticated subject."""
    expires_at = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload: dict[str, Any] = {"sub": subject, "exp": expires_at}
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str, settings: Settings) -> dict[str, Any]:
    """Verify and decode a JWT. HTTP error mapping belongs in the API layer."""
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
