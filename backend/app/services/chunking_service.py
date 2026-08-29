import uuid
from typing import List, Dict, Any, Optional

class Chunk:
    def __init__(
        self,
        chunk_id: str,
        document_id: str,
        user_id: str,
        chunk_index: int,
        page_number: int,
        content: str,
        char_count: int,
        token_count: int,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.id = chunk_id
        self.document_id = document_id
        self.user_id = user_id
        self.chunk_index = chunk_index
        self.page_number = page_number
        self.content = content
        self.char_count = char_count
        self.token_count = token_count
        self.metadata = metadata or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "document_id": self.document_id,
            "user_id": self.user_id,
            "chunk_index": self.chunk_index,
            "page_number": self.page_number,
            "content": self.content,
            "char_count": self.char_count,
            "token_count": self.token_count,
            "metadata": self.metadata
        }

class ChunkingService:
    """Service for splitting extracted page text into semantic overlapping chunks."""

    def __init__(self, target_chunk_size: int = 600, chunk_overlap: int = 120):
        self.target_chunk_size = target_chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_document_pages(
        self,
        document_id: str,
        user_id: str,
        pages: List[Dict[str, Any]]
    ) -> List[Chunk]:
        """Split document pages into coherent chunks preserving page provenance."""
        chunks: List[Chunk] = []
        chunk_index = 0

        for page in pages:
            page_number = page.get("page_number", 1)
            raw_text = page.get("text", "").strip()

            if not raw_text:
                continue

            # Split into paragraph blocks
            paragraphs = [p.strip() for p in raw_text.split("\n\n") if p.strip()]
            if not paragraphs:
                paragraphs = [raw_text]

            current_chunk_text = ""
            
            for para in paragraphs:
                # If adding paragraph exceeds target chunk size, commit current chunk
                if len(current_chunk_text) + len(para) > self.target_chunk_size and len(current_chunk_text) > 0:
                    chunk_obj = self._create_chunk(
                        document_id, user_id, chunk_index, page_number, current_chunk_text
                    )
                    chunks.append(chunk_obj)
                    chunk_index += 1

                    # Retain overlap from end of previous chunk
                    overlap_start = max(0, len(current_chunk_text) - self.chunk_overlap)
                    overlap_text = current_chunk_text[overlap_start:]
                    current_chunk_text = overlap_text + "\n" + para
                else:
                    if current_chunk_text:
                        current_chunk_text += "\n\n" + para
                    else:
                        current_chunk_text = para

            # Commit trailing text for the page
            if current_chunk_text.strip():
                chunk_obj = self._create_chunk(
                    document_id, user_id, chunk_index, page_number, current_chunk_text.strip()
                )
                chunks.append(chunk_obj)
                chunk_index += 1

        return chunks

    def _create_chunk(
        self,
        document_id: str,
        user_id: str,
        chunk_index: int,
        page_number: int,
        text: str
    ) -> Chunk:
        cleaned = text.strip()
        char_count = len(cleaned)
        token_count = max(1, char_count // 4)
        return Chunk(
            chunk_id=str(uuid.uuid4()),
            document_id=document_id,
            user_id=user_id,
            chunk_index=chunk_index,
            page_number=page_number,
            content=cleaned,
            char_count=char_count,
            token_count=token_count,
            metadata={"page": page_number, "index": chunk_index}
        )

chunking_service = ChunkingService()
