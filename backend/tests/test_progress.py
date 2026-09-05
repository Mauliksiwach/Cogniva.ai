import pytest
import asyncio
from httpx import AsyncClient
from backend.main import app
from app.core.supabase_client import get_client

@pytest.fixture(autouse=True)
async def populate_mock_data():
    """Populate the in‑memory mock Supabase client with minimal data for the analytics.
    The mock client is used when environment variables for Supabase are absent.
    """
    client = get_client()
    # Ensure tables exist in the mock client
    for tbl in ["documents", "quiz_attempts", "quiz_answers", "quiz_questions"]:
        client.create_table(tbl)
    # Insert a single document
    client.insert("documents", {"id": "doc1", "user_id": "user123", "created_at": "2024-01-01T00:00:00Z"})
    # Insert a quiz attempt with one answer and a question
    client.insert("quiz_attempts", {"id": "attempt1", "user_id": "user123", "quiz_id": "quiz1", "created_at": "2024-01-02T00:00:00Z"})
    client.insert("quiz_questions", {"id": "q1", "quiz_id": "quiz1", "question_text": "What is 2+2?"})
    client.insert("quiz_answers", {"id": "ans1", "quiz_attempt_id": "attempt1", "question_id": "q1", "score": 1})
    yield
    # No cleanup needed for in‑memory mock

@pytest.mark.asyncio
async def test_progress_endpoint_returns_summary():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.get("/api/v1/progress", params={"user_id": "user123"})
        assert response.status_code == 200
        data = response.json()
        expected_keys = {
            "total_documents",
            "total_questions_asked",
            "total_quizzes_taken",
            "average_quiz_score",
            "weak_topics",
            "score_history",
        }
        assert expected_keys.issubset(data.keys())
        assert data["total_documents"] == 1
        assert data["total_quizzes_taken"] == 1
        assert data["average_quiz_score"] == 1.0
