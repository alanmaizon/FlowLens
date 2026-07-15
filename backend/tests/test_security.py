from app.core.config import Settings
from app.core.security import create_access_token, decode_access_token


def test_access_tokens_round_trip() -> None:
    settings = Settings(secret_key="a-test-secret-with-at-least-32-bytes")

    token = create_access_token("user-123", settings, {"scope": "workspace"})

    assert decode_access_token(token, settings)["sub"] == "user-123"
