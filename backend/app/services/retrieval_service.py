import re
import math
from typing import List, Dict, Any, Optional
from app.services.chunking_service import chunking_service, Chunk
from app.services.document_service import document_service

class ScoredChunk:
    def __init__(
        self,
        chunk: Chunk,
        document_title: str,
        score: float,
        matched_terms: List[str]
    ):
        self.chunk = chunk
        self.document_title = document_title
        self.score = score
        self.matched_terms = matched_terms

    def to_citation_dict(self) -> Dict[str, Any]:
        return {
            "document_id": self.chunk.document_id,
            "document_title": self.document_title,
            "page_number": self.chunk.page_number,
            "chunk_index": self.chunk.chunk_index,
            "snippet": self.chunk.content[:280] + ("..." if len(self.chunk.content) > 280 else ""),
            "score": round(self.score, 4)
        }

class RetrievalService:
    """Modular retrieval service for ranking document chunks using BM25 & term-frequency scoring."""

    def __init__(self):
        # In-memory index of chunks per document
        self._doc_chunks: Dict[str, List[Chunk]] = {}

    def index_document(self, document_id: str, user_id: str, pages: List[Dict[str, Any]]) -> List[Chunk]:
        """Chunk and index document pages."""
        chunks = chunking_service.chunk_document_pages(document_id, user_id, pages)
        self._doc_chunks[document_id] = chunks
        return chunks

    def get_document_chunks(self, document_id: str, user_id: str) -> List[Chunk]:
        """Retrieve or build chunk list for a document."""
        if document_id in self._doc_chunks:
            return self._doc_chunks[document_id]

        # Lazy chunking from document_service pages if not yet chunked
        pages = document_service.get_document_pages(document_id, user_id)
        return self.index_document(document_id, user_id, pages)

    def retrieve_relevant_chunks(
        self,
        user_id: str,
        document_ids: List[str],
        query: str,
        top_k: int = 4
    ) -> List[ScoredChunk]:
        """Search across selected documents and return top-k most relevant chunks with citations."""
        query_terms = self._tokenize(query)
        if not query_terms:
            return []

        all_candidates: List[ScoredChunk] = []

        for doc_id in document_ids:
            try:
                doc = document_service.get_document(doc_id, user_id)
                doc_title = doc.get("title", "Study Material")
                chunks = self.get_document_chunks(doc_id, user_id)

                for chunk in chunks:
                    score, matched = self._score_chunk(chunk.content, query_terms)
                    if score > 0:
                        all_candidates.append(
                            ScoredChunk(
                                chunk=chunk,
                                document_title=doc_title,
                                score=score,
                                matched_terms=matched
                            )
                        )
            except Exception:
                continue

        # Sort descending by relevance score
        all_candidates.sort(key=lambda x: x.score, reverse=True)
        return all_candidates[:top_k]

    def _tokenize(self, text: str) -> List[str]:
        """Extract lowercase alphanumeric tokens, filtering short stop words."""
        stop_words = {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
            "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
            "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
            "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
            "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
            "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself",
            "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off",
            "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out",
            "over", "own", "same", "she", "should", "so", "some", "such", "than", "that",
            "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they",
            "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
            "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why",
            "with", "would", "you", "your", "yours", "yourself", "yourselves"
        }
        tokens = re.findall(r'[a-zA-Z0-9_]+', text.lower())
        return [t for t in tokens if len(t) > 1 and t not in stop_words]

    def _score_chunk(self, content: str, query_terms: List[str]) -> tuple[float, List[str]]:
        content_lower = content.lower()
        content_tokens = re.findall(r'[a-zA-Z0-9_]+', content_lower)
        token_count = len(content_tokens)
        if token_count == 0:
            return 0.0, []

        term_freqs: Dict[str, int] = {}
        for t in content_tokens:
            term_freqs[t] = term_freqs.get(t, 0) + 1

        score = 0.0
        matched_terms: List[str] = []

        for term in query_terms:
            tf = term_freqs.get(term, 0)
            if tf > 0:
                matched_terms.append(term)
                # BM25 term frequency saturation: (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (doc_len / avg_len)))
                # Simplified robust saturation:
                term_score = (tf / (tf + 1.2)) * (1.0 + math.log(1 + len(term)))
                score += term_score

            # Exact phrase / n-gram match bonus
            if term in content_lower:
                score += 0.5

        # Query coverage ratio bonus
        coverage = len(matched_terms) / len(query_terms) if query_terms else 0
        final_score = score * (1.0 + coverage * 2.0)

        return final_score, matched_terms

retrieval_service = RetrievalService()
