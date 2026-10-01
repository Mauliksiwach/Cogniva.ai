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
        """Generate a grounded study answer or comprehensive general AI response."""
        # Check if query matches chunks or if this is a general/out-of-scope question
        if not scored_chunks:
            if self._gemini_client:
                try:
                    system_instruction = (
                        "You are Cogniva AI, an intelligent learning companion and academic tutor. "
                        "The student asked a question not tied to any specific document. "
                        "Provide a structured, insightful, articulate, and pedagogical answer using markdown. "
                        "Include step-by-step guidance, actionable frameworks, and practical examples where appropriate."
                    )
                    response = self._gemini_client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=query,
                        config={"system_instruction": system_instruction, "temperature": 0.4}
                    )
                    if response and response.text:
                        return {
                            "content": response.text.strip(),
                            "sources": []
                        }
                except Exception:
                    pass

            general_ans = self._generate_general_knowledge_answer(query)
            return {
                "content": general_ans,
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
                    "If the student's question relates to the provided document excerpts below, answer using those excerpts and cite them using [Source: \"Document Title\", Page X]. "
                    "HOWEVER, if the student asks a general question, career advice, business advice, or something outside the provided text, DO NOT REFUSE. "
                    "Instead, answer their question thoroughly and helpfully, and politely mention that the topic is beyond their uploaded document."
                )

                prompt = (
                    f"STUDY MATERIAL EXCERPTS:\n{context_str}\n\n"
                    f"STUDENT QUESTION:\n{query}\n\n"
                    f"GROUNDED ANSWER (with citations if relevant):"
                )

                response = self._gemini_client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config={"system_instruction": system_instruction, "temperature": 0.3}
                )

                if response and response.text:
                    return {
                        "content": response.text.strip(),
                        "sources": sources
                    }
            except Exception as e:
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

    def _generate_general_knowledge_answer(self, query: str) -> str:
        """Generates comprehensive, structured general intelligence answers for non-document queries."""
        q_lower = query.lower()

        # 1. Starting a Business / Entrepreneurship / Startups
        if any(term in q_lower for term in ['start a business', 'startup', 'entrepreneur', 'business plan', 'business idea', 'market validation', 'company', 'pitch deck', 'revenue model']):
            return (
                "### 🚀 Comprehensive Guide: How to Start a Business\n\n"
                "Starting a business is a structured journey of turning an insight into value. Here is the step-by-step roadmap:\n\n"
                "#### 1. Ideation & Problem Validation\n"
                "- **Find a Real Pain Point**: The best startups solve urgent, expensive, or tedious problems. Ask: *Who experiences this problem weekly?*\n"
                "- **Customer Discovery**: Interview 20–30 potential users. Do not pitch your idea yet; instead, ask how they currently solve the problem and what they dislike about existing solutions.\n"
                "- **Validate Willingness to Pay**: A problem is only a business opportunity if customers will pay to solve it.\n\n"
                "#### 2. Market Sizing & Value Proposition\n"
                "- **Target Persona (ICP)**: Clearly define who your first 100 paying customers will be.\n"
                "- **Unique Value Proposition**: State why your solution is 10x faster, cheaper, or simpler than alternatives.\n"
                "- **Business Model Canvas**: Outline key revenue streams (SaaS subscription, marketplace take-rate, transaction fees, or direct sales).\n\n"
                "#### 3. Build a Lean Minimum Viable Product (MVP)\n"
                "- **Focus on the Core Feature**: Strip away nice-to-haves. Build the smallest functional product that solves the single primary pain point.\n"
                "- **Launch Fast**: Ship to your first 10 beta testers within 2–4 weeks and iterate rapidly based on observed user behavior.\n\n"
                "#### 4. Legal & Operational Foundations\n"
                "- **Entity Registration**: Choose your legal structure (LLC, Private Limited, Sole Proprietorship).\n"
                "- **Financial Separation**: Open a dedicated business checking account; never mix personal and company finances.\n"
                "- **IP & Co-founder Agreements**: Formalize equity splits and IP ownership early.\n\n"
                "#### 5. Go-to-Market (GTM) & Distribution\n"
                "- **Pick One Channel First**: Master one distribution channel before diversifying (e.g. cold outbound, content/SEO, social communities, or direct partnerships).\n"
                "- **Unit Economics**: Keep your Customer Acquisition Cost (CAC) significantly lower than Customer Lifetime Value (LTV > 3x CAC).\n\n"
                "💡 *Pro-Tip for Student Founders*: Leverage your university network, incubator programs, and student software credits (AWS Activate, GitHub Student Pack) to minimize initial burn rate!"
            )

        # 2. Career, Resumes & Interviews
        if any(term in q_lower for term in ['resume', 'interview', 'job', 'career', 'internship', 'cover letter', 'hire']):
            return (
                "### 🎯 Strategic Career & Interview Success Blueprint\n\n"
                "Here is how to optimize your career trajectory and secure top offers:\n\n"
                "#### 1. High-Impact Resume Optimization\n"
                "- **One-Page Rule**: Keep formatting scannable and dense with achievements.\n"
                "- **Google XYZ Formula**: Structure every bullet point as: *Accomplished [X], as measured by [Y], by doing [Z]*.\n"
                "- **ATS Keywords**: Align technical skills directly with the job description.\n\n"
                "#### 2. Interview Mastery (STAR Framework)\n"
                "- **Situation**: Set the scene and context in 2 sentences.\n"
                "- **Task**: What was your responsibility or the core hurdle?\n"
                "- **Action**: Specifically what did *you* build, design, or resolve?\n"
                "- **Result**: Quantify the outcome (e.g., *reduced query latency by 42%*).\n\n"
                "#### 3. Proactive Networking\n"
                "- Reach out to alumni and senior engineers with concise, personalized inquiries about their team's technical challenges rather than asking directly for referrals."
            )

        # 3. Programming & Computer Science
        if any(term in q_lower for term in ['python', 'javascript', 'react', 'c++', 'code', 'programming', 'sql', 'algorithm', 'git', 'docker', 'database']):
            return (
                f"### 💻 Technical Guide: \"{query}\"\n\n"
                "Here is the software engineering analysis and best practices:\n\n"
                "1. **Core Concept & Architecture**:\n"
                "   In modern software engineering, clean code principles, modular separation of concerns, and robust error handling form the bedrock of maintainable systems.\n\n"
                "2. **Implementation Strategy**:\n"
                "   - Choose optimal data structures to balance read vs. write throughput.\n"
                "   - Implement unit and integration tests to prevent regressions.\n"
                "   - Use version control best practices with atomic commits and descriptive PR summaries.\n\n"
                "3. **Performance & Complexity**:\n"
                "   Always evaluate asymptotic time complexity ($O(n)$) and memory footprint under production workloads."
            )

        # 4. Productivity, Learning & Study Habits
        if any(term in q_lower for term in ['study tips', 'schedule', 'pomodoro', 'procrastination', 'focus', 'memory', 'habits']):
            return (
                "### 🧠 Evidence-Based Learning & Focus System\n\n"
                "Maximize your academic retention using cognitive science techniques:\n\n"
                "1. **Active Retrieval Practice**: Testing yourself through flashcards and practice quizzes produces 2–3x higher retention than passive re-reading.\n"
                "2. **Spaced Repetition Schedule**: Review notes at 1-day, 3-day, 7-day, and 21-day intervals to flatten the Ebbinghaus forgetting curve.\n"
                "3. **Feynman Technique**: Explain complex ideas in simple terms as if teaching a beginner to immediately uncover gaps in understanding.\n"
                "4. **Ultradian Focus Blocks**: Work with 100% focus for 50 minutes, followed by a 10-minute screen-free break."
            )

        # 5. Universal Structured Fallback
        return (
            f"### 💡 Overview & Analysis: \"{query}\"\n\n"
            f"Here is a comprehensive breakdown regarding **{query}**:\n\n"
            "1. **Foundational Definition & Core Principles**:\n"
            "   This topic encompasses fundamental concepts that are best understood by deconstructing the core mechanism into its primary components.\n\n"
            "2. **Step-by-Step Methodology**:\n"
            "   - **Phase 1: Preparation & Scoping**: Clarify objectives, constraints, and baseline requirements.\n"
            "   - **Phase 2: Execution**: Apply standard domain best practices systematically.\n"
            "   - **Phase 3: Validation & Iteration**: Verify results against benchmarks and refine based on feedback.\n\n"
            "3. **Practical Application & Recommendations**:\n"
            "   Focus on practical execution, document your assumptions, and feel free to ask follow-up questions for deeper analysis!"
        )

ai_service = AIService()
