import io
import pytest
from pypdf import PdfWriter
from httpx import AsyncClient, ASGITransport
from main import app

def create_sample_pdf(num_pages: int = 2) -> bytes:
    writer = PdfWriter()
    for i in range(num_pages):
        writer.add_blank_page(width=200, height=200)
    buffer = io.BytesIO()
    writer.write(buffer)
    return buffer.getvalue()

@pytest.mark.asyncio
async def test_upload_pdf_success():
    transport = ASGITransport(app=app)
    pdf_bytes = create_sample_pdf(3)
    files = {"file": ("lecture1.pdf", pdf_bytes, "application/pdf")}
    data = {"title": "Introduction to Computer Systems"}
    headers = {"Authorization": "Bearer dev-token-student1"}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/documents/upload", files=files, data=data, headers=headers)
        assert response.status_code == 201
        payload = response.json()
        assert payload["success"] is True
        assert payload["data"]["title"] == "Introduction to Computer Systems"
        assert payload["data"]["page_count"] == 3
        assert payload["data"]["processing_status"] == "ready"

        doc_id = payload["data"]["id"]

        # Test GET /documents
        list_res = await client.get("/api/v1/documents", headers=headers)
        assert list_res.status_code == 200
        docs = list_res.json()["data"]
        assert len(docs) >= 1
        assert any(d["id"] == doc_id for d in docs)

        # Test GET /documents/{id}
        detail_res = await client.get(f"/api/v1/documents/{doc_id}", headers=headers)
        assert detail_res.status_code == 200
        assert detail_res.json()["data"]["id"] == doc_id

        # Test GET /documents/{id}/pages
        pages_res = await client.get(f"/api/v1/documents/{doc_id}/pages", headers=headers)
        assert pages_res.status_code == 200
        pages = pages_res.json()["data"]
        assert len(pages) == 3

        # Test DELETE /documents/{id}
        del_res = await client.delete(f"/api/v1/documents/{doc_id}", headers=headers)
        assert del_res.status_code == 200

        # Verify deletion
        get_again = await client.get(f"/api/v1/documents/{doc_id}", headers=headers)
        assert get_again.status_code == 404

@pytest.mark.asyncio
async def test_upload_invalid_extension():
    transport = ASGITransport(app=app)
    files = {"file": ("malicious.exe", b"binary content", "application/octet-stream")}
    headers = {"Authorization": "Bearer dev-token-student1"}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/documents/upload", files=files, headers=headers)
        assert response.status_code == 400
        assert "Only PDF" in response.json()["error"]["message"]

@pytest.mark.asyncio
async def test_upload_empty_pdf():
    transport = ASGITransport(app=app)
    files = {"file": ("empty.pdf", b"", "application/pdf")}
    headers = {"Authorization": "Bearer dev-token-student1"}

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/documents/upload", files=files, headers=headers)
        assert response.status_code == 400
        assert "empty" in response.json()["error"]["message"]
