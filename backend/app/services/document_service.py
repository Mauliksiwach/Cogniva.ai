import os
import io
import uuid
import zipfile
import xml.etree.ElementTree as ET
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
    """Production service for handling multi-format document upload (PDF, Word, PowerPoint, Text), storage, and text extraction."""

    def __init__(self):
        self._documents: Dict[str, Dict[str, Any]] = {}
        self._document_pages: Dict[str, List[Dict[str, Any]]] = {}

    def get_upload_path(self, user_id: str, document_id: str, filename: str) -> str:
        user_dir = os.path.join(settings.UPLOAD_DIR, user_id)
        os.makedirs(user_dir, exist_ok=True)
        safe_filename = f"{document_id}_{filename}"
        return os.path.join(user_dir, safe_filename)

    def extract_text_from_file_bytes(self, file_bytes: bytes, filename: str) -> Tuple[int, List[ExtractedPage], str]:
        """Extract text from PDF, DOCX, PPTX, TXT, MD, or legacy document files."""
        _, ext = os.path.splitext(filename.lower())

        if ext == ".pdf":
            return self._extract_from_pdf(file_bytes)
        elif ext == ".docx":
            return self._extract_from_docx(file_bytes)
        elif ext == ".pptx":
            return self._extract_from_pptx(file_bytes)
        elif ext in [".txt", ".md"]:
            return self._extract_from_text(file_bytes)
        else:
            # Fallback for .doc / .ppt / unrecognized text
            return self._extract_from_raw_bytes(file_bytes)

    def _extract_from_pdf(self, pdf_bytes: bytes) -> Tuple[int, List[ExtractedPage], str]:
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
                token_count = max(1, char_count // 4) if char_count > 0 else 0

                extracted_pages.append(ExtractedPage(
                    page_number=index + 1,
                    text=cleaned_text,
                    char_count=char_count,
                    token_count=token_count
                ))

                if cleaned_text and len(full_text_preview) < 3:
                    full_text_preview.append(cleaned_text[:300])

            total_chars = sum(p.char_count for p in extracted_pages)
            sample = " ".join(full_text_preview)
            summary = f"Indexed {page_count} pages with ~{total_chars} total characters. " + (sample[:250] + "..." if len(sample) > 250 else sample)
            return page_count, extracted_pages, summary

        except Exception as e:
            if isinstance(e, BadRequestException):
                raise e
            raise BadRequestException(f"Failed to parse PDF document: {str(e)}")

    def _extract_from_docx(self, docx_bytes: bytes) -> Tuple[int, List[ExtractedPage], str]:
        try:
            with zipfile.ZipFile(io.BytesIO(docx_bytes)) as z:
                xml_content = z.read("word/document.xml")
                tree = ET.fromstring(xml_content)
                text_nodes = tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                full_text = "".join([node.text for node in text_nodes if node.text])

            cleaned = self._clean_text(full_text)
            char_count = len(cleaned)
            token_count = max(1, char_count // 4)

            page = ExtractedPage(page_number=1, text=cleaned, char_count=char_count, token_count=token_count)
            summary = f"Indexed Word Document (.docx) with ~{char_count} characters. " + (cleaned[:250] + "..." if len(cleaned) > 250 else cleaned)
            return 1, [page], summary
        except Exception as err:
            raise BadRequestException(f"Failed to parse Word (.docx) document: {str(err)}")

    def _extract_from_pptx(self, pptx_bytes: bytes) -> Tuple[int, List[ExtractedPage], str]:
        try:
            extracted_pages: List[ExtractedPage] = []
            slide_index = 1
            with zipfile.ZipFile(io.BytesIO(pptx_bytes)) as z:
                slide_files = [f for f in z.namelist() if f.startswith("ppt/slides/slide") and f.endswith(".xml")]
                slide_files.sort()

                for slide_file in slide_files:
                    xml_content = z.read(slide_file)
                    tree = ET.fromstring(xml_content)
                    text_nodes = tree.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t')
                    slide_text = " ".join([node.text for node in text_nodes if node.text])
                    cleaned = self._clean_text(slide_text)
                    char_count = len(cleaned)
                    token_count = max(1, char_count // 4)

                    extracted_pages.append(ExtractedPage(
                        page_number=slide_index,
                        text=cleaned,
                        char_count=char_count,
                        token_count=token_count
                    ))
                    slide_index += 1

            total_chars = sum(p.char_count for p in extracted_pages)
            summary = f"Indexed PowerPoint Presentation (.pptx) with {len(extracted_pages)} slides and ~{total_chars} characters."
            return len(extracted_pages), extracted_pages, summary
        except Exception as err:
            raise BadRequestException(f"Failed to parse PowerPoint (.pptx) document: {str(err)}")

    def _extract_from_text(self, text_bytes: bytes) -> Tuple[int, List[ExtractedPage], str]:
        try:
            content = text_bytes.decode("utf-8", errors="ignore")
            cleaned = self._clean_text(content)
            char_count = len(cleaned)
            token_count = max(1, char_count // 4)
            page = ExtractedPage(page_number=1, text=cleaned, char_count=char_count, token_count=token_count)
            summary = f"Indexed Text/Markdown note with ~{char_count} characters. " + (cleaned[:250] + "..." if len(cleaned) > 250 else cleaned)
            return 1, [page], summary
        except Exception as err:
            raise BadRequestException(f"Failed to read text note: {str(err)}")

    def _extract_from_raw_bytes(self, raw_bytes: bytes) -> Tuple[int, List[ExtractedPage], str]:
        # Simple printable ASCII string extraction fallback for legacy .doc/.ppt
        text = "".join([chr(b) for b in raw_bytes if 32 <= b <= 126 or b in [10, 13, 9]])
        cleaned = self._clean_text(text)
        char_count = len(cleaned)
        token_count = max(1, char_count // 4)
        page = ExtractedPage(page_number=1, text=cleaned[:5000], char_count=char_count, token_count=token_count)
        summary = f"Processed document with ~{char_count} raw characters extracted."
        return 1, [page], summary

    def _clean_text(self, text: str) -> str:
        if not text:
            return ""
        text = text.replace('\r\n', '\n').replace('\r', '\n').replace('\t', ' ')
        lines = [line.strip() for line in text.split('\n')]
        return "\n".join([line for line in lines if line])

    async def save_and_process_document(
        self,
        user_id: str,
        filename: str,
        file_bytes: bytes,
        title: Optional[str] = None
    ) -> Dict[str, Any]:
        document_id = str(uuid.uuid4())
        file_size = len(file_bytes)

        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            raise BadRequestException(f"File size ({file_size / (1024*1024):.1f}MB) exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB")

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
            "file_type": os.path.splitext(filename)[1].lower(),
            "page_count": 0,
            "processing_status": "processing",
            "error_message": None,
            "summary": None,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }

        try:
            page_count, extracted_pages, summary = self.extract_text_from_file_bytes(file_bytes, filename)
            doc_record["page_count"] = page_count
            doc_record["processing_status"] = "ready"
            doc_record["summary"] = summary
            doc_record["updated_at"] = datetime.now(timezone.utc).isoformat()

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
        docs = [d for d in self._documents.values() if d["user_id"] == user_id]
        return sorted(docs, key=lambda x: x["created_at"], reverse=True)

    def get_document(self, document_id: str, user_id: str) -> Dict[str, Any]:
        doc = self._documents.get(document_id)
        if not doc or doc["user_id"] != user_id:
            raise NotFoundException("Document not found or access denied.")
        return doc

    def get_document_pages(self, document_id: str, user_id: str) -> List[Dict[str, Any]]:
        self.get_document(document_id, user_id)
        return self._document_pages.get(document_id, [])

    def delete_document(self, document_id: str, user_id: str) -> bool:
        doc = self.get_document(document_id, user_id)
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
