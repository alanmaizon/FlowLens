import asyncio

import httpx

from app.main import app


def test_liveness_returns_ok() -> None:
    """The liveness endpoint must not need a database connection."""

    async def request_health() -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.get("/api/v1/health")

    response = asyncio.run(request_health())

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] is None
