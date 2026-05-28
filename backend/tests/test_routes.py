from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

import app.cache as cache_module
from app import app


@pytest.fixture(autouse=True)
def clear_cache():
    cache_module._answer_cache.clear()
    yield
    cache_module._answer_cache.clear()


@pytest.fixture
def client():
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


# ── /health ───────────────────────────────────────────────────────────────────

async def test_health(client):
    async with client as c:
        resp = await c.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


# ── /solve ────────────────────────────────────────────────────────────────────

async def test_solve_returns_answer(client):
    mock_result = MagicMock()
    mock_result.content = "1. b) Mitochondria"

    with patch("app.router.llm") as mock_llm:
        mock_llm.ainvoke = AsyncMock(return_value=mock_result)
        async with client as c:
            resp = await c.post("/solve", json={
                "page_content": "1. What is the powerhouse of the cell?",
                "page_title": "Biology Quiz",
            })

    assert resp.status_code == 200
    data = resp.json()
    assert data["response"] == "1. b) Mitochondria"
    assert data["cached"] is False


async def test_solve_uses_cache_on_second_call(client):
    mock_result = MagicMock()
    mock_result.content = "1. b) Mitochondria"

    with patch("app.router.llm") as mock_llm:
        mock_llm.ainvoke = AsyncMock(return_value=mock_result)
        async with client as c:
            payload = {
                "page_content": "1. What is the powerhouse of the cell?",
                "page_title": "Biology Quiz",
            }
            await c.post("/solve", json=payload)
            resp = await c.post("/solve", json=payload)

    assert resp.json()["cached"] is True
    assert mock_llm.ainvoke.call_count == 1  # LLM called only once


async def test_solve_empty_content_returns_400(client):
    async with client as c:
        resp = await c.post("/solve", json={"page_content": "   "})
    assert resp.status_code == 400


async def test_solve_llm_error_returns_502(client):
    with patch("app.router.llm") as mock_llm:
        mock_llm.ainvoke = AsyncMock(side_effect=RuntimeError("LLM unavailable"))
        async with client as c:
            resp = await c.post("/solve", json={
                "page_content": "1. What is gravity?",
            })
    assert resp.status_code == 502
