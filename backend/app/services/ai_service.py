import os
from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.retrieval_service import ScoredChunk

class AIService:
    """Service for grounded document question answering and summaries."""

    def __init__(self):
        self._gemini_client = None
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip() and settings.GEMINI_API_KEY != "your-gemini-api-key":
            try:
                from google import genai
                self._gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception:
                self._gemini_client = None

    async def answer_question(
        self,
        query: str,
        scored_chunks: List[ScoredChunk],
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """Generate a grounded study answer with strict citation attribution."""
        if not scored_chunks:
            return {
                "content": "I could not find information regarding your query in the uploaded study materials. Please select the relevant document or rephrase your question based on the document's topics.",
                "sources": []
            }

        # Build context block
        context_sections = []
        sources = []
        for i, item in enumerate(scored_chunks):
            citation = item.to_citation_dict()
            sources.append(citation)
            context_sections.append(
                f"[Document: \"{item.document_title}\" | Page: {item.chunk.page_number} | Index: {item.chunk.chunk_index}]\n{item.chunk.content}"
            )

        context_str = "\n\n---\n\n".join(context_sections)

        # 1. Attempt Gemini API generation if client initialized
        if self._gemini_client:
            try:
                system_instruction = (
                    "You are Cogniva AI, an intelligent learning companion and academic study tutor. "
                    "Your primary rule is STRICT GROUNDING: answer the student's question using ONLY the provided document excerpts below. "
                    "Always cite your sources inline using [Source: \"Document Title\", Page X] format corresponding to the excerpts. "
                    "If the answer cannot be found in or deduced from the provided excerpts, clearly state: "
                    "'I could not find sufficient information regarding this in the uploaded study materials.' "
                    "Do not invent facts, citations, or extrapolate beyond the provided text. Keep explanations clear, structured, and pedagogical."
                )

                prompt = (
                    f"STUDY MATERIAL EXCERPTS:\n{context_str}\n\n"
                    f"STUDENT QUESTION:\n{query}\n\n"
                    f"GROUNDED ANSWER (with citations):"
                )

                response = self._gemini_client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config={"system_instruction": system_instruction, "temperature": 0.2}
                )

                if response and response.text:
                    return {
                        "content": response.text.strip(),
                        "sources": sources
                    }
            except Exception as e:
                # Log error and fall back to internal grounded synthesizer
                pass

        # 2. High-quality deterministic grounded synthesizer (Fallback / Dev mode)
        synthesized_content = self._synthesize_grounded_answer(query, scored_chunks, sources)
        return {
            "content": synthesized_content,
            "sources": sources
        }

    async def generate_document_summary(
        self,
        doc_title: str,
        pages: List[Dict[str, Any]]
    ) -> str:
        """Generate structured study revision notes and key takeaways for a document."""
        full_text = "\n\n".join([f"Page {p['page_number']}:\n{p['text']}" for p in pages if p.get('text')])
        if not full_text.strip():
            return f"No selectable text found in '{doc_title}' to summarize."

        # Limit to first 12,000 characters for summary prompt
        sampled_text = full_text[:12000]

        if self._gemini_client:
            try:
                prompt = (
                    f"Generate a comprehensive, structured Study Summary and Revision Guide for university students based on the following course material.\n\n"
                    f"DOCUMENT TITLE: {doc_title}\n\n"
                    f"CONTENT:\n{sampled_text}\n\n"
                    f"Please format your summary with:\n"
                    f"1. **Core Overview & Objectives**\n"
                    f"2. **Key Concepts & Definitions**\n"
                    f"3. **High-Yield Revision Points**\n"
                    f"4. **Important Formulas / Principles (if applicable)**\n"
                )

                response = self._gemini_client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config={"temperature": 0.3}
                )
                if response and response.text:
                    return response.text.strip()
            except Exception:
                pass

        # Deterministic summary fallback
        return (
            f"### 📚 Cogniva AI Study Guide: {doc_title}\n\n"
            f"**Overview:**\n"
            f"This material spans {len(pages)} pages covering foundational concepts and core principles in {doc_title}.\n\n"
            f"**Key Focus Areas Extracted:**\n"
            + "\n".join([f"- **Page {p['page_number']}:** {p['text'][:140]}..." for p in pages[:5] if p.get('text')])
            + "\n\n**Recommendation:** Use the AI Study Chat to ask specific questions about each section or generate a practice quiz to test your active recall!"
        )

    def _synthesize_grounded_answer(
        self,
        query: str,
        scored_chunks: List[ScoredChunk],
        sources: List[Dict[str, Any]]
    ) -> str:
        """Synthesizes a structured response from the retrieved chunks with citations."""
        top_chunk = scored_chunks[0]
        citations_str = ", ".join([f"[{s['document_title']}, Page {s['page_number']}]" for s in sources[:2]])

        answer_lines = [
            f"Based on your uploaded materials ({citations_str}), here is the relevant information:\n",
            f"> \"{top_chunk.chunk.content.strip()}\"\n"
        ]

        if len(scored_chunks) > 1:
            second_chunk = scored_chunks[1]
            answer_lines.append(
                f"\n**Additional Context [{second_chunk.document_title}, Page {second_chunk.chunk.page_number}]:**\n"
                f"{second_chunk.chunk.content.strip()}\n"
            )

        answer_lines.append(
            f"\n*Sources cited: {citations_str}*"
        )

        return "\n".join(answer_lines)

ai_service = AIService()
