import os
import io
import uuid
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone
from pypdf import PdfReader
from app.config import settings
from app.core.exceptions import BadRequestException, NotFoundException

class ExtractedPage:
    def __init__(self, page_number: int, text: str, char_count: int, token_count: int):
        self.page_number = page_number
        self.text = text
        self.char_count = char_count
        self.token_count = token_count

    def to_dict(self) -> Dict[str, Any]:
        return {
            "page_number": self.page_number,
            "text": self.text,
            "char_count": self.char_count,
            "token_count": self.token_count
        }

class DocumentService:
    """Production service for handling PDF upload, storage, validation, and text extraction."""

    def __init__(self):
        # In-memory store for documents metadata and extracted page text in dev/standalone mode
        # In production with full Supabase, this mirrors/syncs with PostgreSQL
        self._documents: Dict[str, Dict[str, Any]] = {}
        self._document_pages: Dict[str, List[Dict[str, Any]]] = {}

    def get_upload_path(self, user_id: str, document_id: str, filename: str) -> str:
        user_dir = os.path.join(settings.UPLOAD_DIR, user_id)
        os.makedirs(user_dir, exist_ok=True)
        safe_filename = f"{document_id}_{filename}"
        return os.path.join(user_dir, safe_filename)

    def extract_text_from_pdf_bytes(self, pdf_bytes: bytes) -> Tuple[int, List[ExtractedPage], str]:
        """Extract text from raw PDF bytes page by page."""
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            page_count = len(reader.pages)
            if page_count == 0:
                raise BadRequestException("The uploaded PDF file contains zero pages.")

            extracted_pages: List[ExtractedPage] = []
            full_text_preview: List[str] = []

            for index, page in enumerate(reader.pages):
                raw_text = page.extract_text() or ""
                cleaned_text = self._clean_text(raw_text)
                char_count = len(cleaned_text)
                # Approximation: ~4 chars per token for English
                token_count = max(1, char_count // 4) if char_count > 0 else 0

                extracted_pages.append(ExtractedPage(
                    page_number=index + 1,
                    text=cleaned_text,
                    char_count=char_count,
                    token_count=token_count
                ))

                if cleaned_text and len(full_text_preview) < 3:
                    full_text_preview.append(cleaned_text[:300])

            # Check if document has readable text (not purely scanned images without OCR)
            total_chars = sum(p.char_count for p in extracted_pages)
            if total_chars < 20:
                summary = "Note: This PDF appears to contain scanned images or minimal selectable text."
            else:
                sample = " ".join(full_text_preview)
                summary = f"Indexed {page_count} pages with ~{total_chars} total characters. " + (sample[:250] + "..." if len(sample) > 250 else sample)

            return page_count, extracted_pages, summary

        except Exception as e:
            if isinstance(e, BadRequestException):
                raise e
            raise BadRequestException(f"Failed to parse PDF document: {str(e)}")

    def _clean_text(self, text: str) -> str:
        """Normalize whitespace, remove invalid control characters, and clean up line breaks."""
        if not text:
            return ""
        # Normalize carriage returns and tabs
        text = text.replace('\r\n', '\n').replace('\r', '\n').replace('\t', ' ')
        # Remove consecutive blank lines
        lines = [line.strip() for line in text.split('\n')]
        cleaned_lines = []
        for line in lines:
            if line:
                cleaned_lines.append(line)
        return "\n".join(cleaned_lines)

    async def save_and_process_document(
        self,
        user_id: str,
        filename: str,
        file_bytes: bytes,
        title: Optional[str] = None
    ) -> Dict[str, Any]:
        """Save PDF to storage, extract text pages, and record metadata."""
        document_id = str(uuid.uuid4())
        file_size = len(file_bytes)
        
        # Max size validation
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            raise BadRequestException(f"File size ({file_size / (1024*1024):.1f}MB) exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB")

        # Save to disk
        file_path = self.get_upload_path(user_id, document_id, filename)
        with open(file_path, "wb") as f:
            f.write(file_bytes)

        doc_title = title.strip() if title and title.strip() else os.path.splitext(filename)[0]

        now = datetime.now(timezone.utc)
        doc_record: Dict[str, Any] = {
            "id": document_id,
            "user_id": user_id,
            "title": doc_title,
            "file_name": filename,
            "file_path": file_path,
            "file_size": file_size,
            "file_type": "application/pdf",
            "page_count": 0,
            "processing_status": "processing",
            "error_message": None,
            "summary": None,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }

        try:
            page_count, extracted_pages, summary = self.extract_text_from_pdf_bytes(file_bytes)
            doc_record["page_count"] = page_count
            doc_record["processing_status"] = "ready"
            doc_record["summary"] = summary
            doc_record["updated_at"] = datetime.now(timezone.utc).isoformat()

            # Store in-memory
            self._documents[document_id] = doc_record
            self._document_pages[document_id] = [p.to_dict() for p in extracted_pages]

            return doc_record

        except Exception as err:
            doc_record["processing_status"] = "failed"
            doc_record["error_message"] = str(err)
            doc_record["updated_at"] = datetime.now(timezone.utc).isoformat()
            self._documents[document_id] = doc_record
            raise err

    def list_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """List all documents belonging to a user, sorted newest first."""
        docs = [d for d in self._documents.values() if d["user_id"] == user_id]
        return sorted(docs, key=lambda x: x["created_at"], reverse=True)

    def get_document(self, document_id: str, user_id: str) -> Dict[str, Any]:
        """Get document details with authorization check."""
        doc = self._documents.get(document_id)
        if not doc or doc["user_id"] != user_id:
            raise NotFoundException("Document not found or access denied.")
        return doc

    def get_document_pages(self, document_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Get extracted text pages for a document."""
        self.get_document(document_id, user_id)
        return self._document_pages.get(document_id, [])

    def delete_document(self, document_id: str, user_id: str) -> bool:
        """Delete document record and corresponding storage file."""
        doc = self.get_document(document_id, user_id)
        
        # Remove file from disk
        file_path = doc.get("file_path")
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass

        self._documents.pop(document_id, None)
        self._document_pages.pop(document_id, None)
        return True

document_service = DocumentService()
