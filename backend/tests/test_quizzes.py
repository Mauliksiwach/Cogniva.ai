import io
import pytest
from pypdf import PdfWriter
from httpx import AsyncClient, ASGITransport
from main import app

def create_sample_pdf_bytes() -> bytes:
    writer = PdfWriter()
    writer.add_blank_page(width=200, height=200)
    buffer = io.BytesIO()
    writer.write(buffer)
    return buffer.getvalue()

@pytest.mark.asyncio
async def test_quiz_generation_and_scoring_flow():
    transport = ASGITransport(app=app)
    headers = {"Authorization": "Bearer dev-token-student_quiz"}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Upload a document
        pdf_bytes = create_sample_pdf_bytes()
        files = {"file": ("algorithms.pdf", pdf_bytes, "application/pdf")}
        data = {"title": "Algorithms & Complexity"}
        up_res = await client.post("/api/v1/documents/upload", files=files, data=data, headers=headers)
        assert up_res.status_code == 201
        doc_id = up_res.json()["data"]["id"]

        # Populate page text in memory
        from app.services.document_service import document_service
        document_service._document_pages[doc_id] = [
            {
                "page_number": 1,
                "text": "Binary Search has a worst-case time complexity of O(log n). It operates on sorted arrays by repeatedly dividing the search interval in half.",
                "char_count": 140,
                "token_count": 35
            },
            {
                "page_number": 2,
                "text": "Dijkstra's algorithm finds the shortest paths from a single source node to all other nodes in a graph with non-negative edge weights.",
                "char_count": 135,
                "token_count": 33
            }
        ]

        # 2. Generate 5-Question Quiz
        gen_req = {
            "document_id": doc_id,
            "difficulty": "medium",
            "question_count": 5
        }
        gen_res = await client.post("/api/v1/quizzes/generate", json=gen_req, headers=headers)
        assert gen_res.status_code == 201
        quiz_data = gen_res.json()["data"]
        assert quiz_data["question_count"] == 5
        assert len(quiz_data["questions"]) == 5
        quiz_id = quiz_data["id"]

        # 3. List quizzes
        list_res = await client.get("/api/v1/quizzes", headers=headers)
        assert list_res.status_code == 200
        assert len(list_res.json()["data"]) >= 1

        # 4. Get Quiz Details
        get_res = await client.get(f"/api/v1/quizzes/{quiz_id}", headers=headers)
        assert get_res.status_code == 200
        questions = get_res.json()["data"]["questions"]
        assert len(questions) == 5
        # Ensure answers are omitted in pre-test get
        assert "correct_option_index" not in questions[0] or questions[0].get("correct_option_index") is None

        # 5. Submit Attempt
        answers = [
            {"question_id": q["id"], "selected_option_index": 0}
            for q in questions
        ]
        attempt_req = {
            "quiz_id": quiz_id,
            "answers": answers,
            "time_spent_seconds": 45
        }
        att_res = await client.post(f"/api/v1/quizzes/{quiz_id}/attempt", json=attempt_req, headers=headers)
        assert att_res.status_code == 200
        result = att_res.json()["data"]
        assert result["total_questions"] == 5
        assert 0 <= result["score"] <= 5
        assert 0.0 <= result["percentage"] <= 100.0
        assert len(result["detailed_results"]) == 5

        # 6. List Quiz Attempts
        history_res = await client.get(f"/api/v1/quizzes/{quiz_id}/attempts", headers=headers)
        assert history_res.status_code == 200
        assert len(history_res.json()["data"]) >= 1

        # 7. Delete Quiz
        del_res = await client.delete(f"/api/v1/quizzes/{quiz_id}", headers=headers)
        assert del_res.status_code == 200
