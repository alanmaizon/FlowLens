"""Provider-neutral OAuth contract; concrete providers are intentionally not configured yet."""

from typing import Protocol

from pydantic import BaseModel, EmailStr


class OAuthIdentity(BaseModel):
    """Verified identity returned by a provider adapter."""

    provider: str
    provider_subject: str
    email: EmailStr
    display_name: str | None = None


class OAuthIdentityVerifier(Protocol):
    """Verify a provider credential without coupling the rest of the app to a vendor SDK."""

    def verify(self, credential: str) -> OAuthIdentity: ...
