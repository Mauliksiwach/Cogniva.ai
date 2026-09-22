import pytest
import asyncio
from httpx import AsyncClient
from main import app
from app.core.supabase_client import get_client

import pytest_asyncio

@pytest_asyncio.fixture(autouse=True)
async def populate_mock_data():
    """Populate minimal mock data for analytics if using in-memory client."""
    client = get_client()
    if hasattr(client, "create_table"):
        for tbl in ["documents", "quiz_attempts", "quiz_answers", "quiz_questions"]:
            client.create_table(tbl)
        client.insert("documents", {"id": "doc1", "user_id": "user123", "created_at": "2024-01-01T00:00:00Z"})
        client.insert("quiz_attempts", {"id": "attempt1", "user_id": "user123", "quiz_id": "quiz1", "created_at": "2024-01-02T00:00:00Z"})
        client.insert("quiz_questions", {"id": "q1", "quiz_id": "quiz1", "question_text": "What is 2+2?"})
        client.insert("quiz_answers", {"id": "ans1", "quiz_attempt_id": "attempt1", "question_id": "q1", "score": 1})
    yield
    # No cleanup needed for in‑memory mock

from httpx import AsyncClient, ASGITransport

@pytest.mark.asyncio
async def test_progress_endpoint_returns_summary():
    transport = ASGITransport(app=app)
    headers = {"Authorization": "Bearer dev-token-user123"}
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/api/v1/progress", headers=headers)
        assert response.status_code == 200
        data = response.json()["data"]
        expected_keys = {
            "total_documents",
            "total_questions_asked",
            "total_quizzes_taken",
            "average_quiz_score",
            "weak_topics",
            "score_history",
        }
        assert expected_keys.issubset(data.keys())
        assert data["total_documents"] >= 0
        assert data["total_quizzes_taken"] >= 0
        assert data["average_quiz_score"] >= 0.0
