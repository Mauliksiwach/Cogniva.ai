import io
import pytest
from pypdf import PdfWriter
from httpx import AsyncClient, ASGITransport
from main import app

def create_text_pdf(text: str) -> bytes:
    writer = PdfWriter()
    page = writer.add_blank_page(width=300, height=300)
    # Using simple in-memory pdf bytes
    buffer = io.BytesIO()
    writer.write(buffer)
    return buffer.getvalue()

@pytest.mark.asyncio
async def test_chat_grounded_qa_flow():
    transport = ASGITransport(app=app)
    headers = {"Authorization": "Bearer dev-token-student_chat"}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Upload a test document
        pdf_bytes = create_text_pdf("Machine learning is a subset of artificial intelligence.")
        files = {"file": ("ml_intro.pdf", pdf_bytes, "application/pdf")}
        data = {"title": "Machine Learning Fundamentals"}
        up_res = await client.post("/api/v1/documents/upload", files=files, data=data, headers=headers)
        assert up_res.status_code == 201
        doc_id = up_res.json()["data"]["id"]

        # Manually attach text to document page for retrieval test
        from app.services.document_service import document_service
        document_service._document_pages[doc_id] = [
            {
                "page_number": 1,
                "text": "Machine learning algorithms build a mathematical model based on sample data, known as training data, in order to make predictions or decisions without being explicitly programmed.",
                "char_count": 180,
                "token_count": 45
            }
        ]

        # 2. Send Chat Query
        chat_req = {
            "document_ids": [doc_id],
            "message": "What is machine learning training data?"
        }
        chat_res = await client.post("/api/v1/chat", json=chat_req, headers=headers)
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert chat_data["success"] is True
        assert "content" in chat_data["data"]
        assert len(chat_data["data"]["sources"]) > 0
        assert chat_data["data"]["sources"][0]["document_title"] == "Machine Learning Fundamentals"

        conv_id = chat_data["data"]["conversation_id"]

        # 3. List conversations
        conv_res = await client.get("/api/v1/chat/conversations", headers=headers)
        assert conv_res.status_code == 200
        assert len(conv_res.json()["data"]) >= 1

        # 4. Get conversation messages
        msgs_res = await client.get(f"/api/v1/chat/conversations/{conv_id}/messages", headers=headers)
        assert msgs_res.status_code == 200
        messages = msgs_res.json()["data"]
        assert len(messages) >= 2  # user + assistant

        # 5. Summarize document
        sum_res = await client.post(f"/api/v1/chat/summarize/{doc_id}", headers=headers)
        assert sum_res.status_code == 200
        assert "summary" in sum_res.json()["data"]
