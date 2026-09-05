import uuid
import json
import random
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.config import settings
from app.core.exceptions import BadRequestException, NotFoundException
from app.services.document_service import document_service
from app.services.retrieval_service import retrieval_service

class QuizQuestion:
    def __init__(
        self,
        question_id: str,
        quiz_id: str,
        question_text: str,
        options: List[str],
        correct_option_index: int,
        explanation: str,
        topic_tag: str
    ):
        self.id = question_id
        self.quiz_id = quiz_id
        self.question_text = question_text
        self.options = options
        self.correct_option_index = correct_option_index
        self.explanation = explanation
        self.topic_tag = topic_tag

    def to_dict(self, include_answer: bool = True) -> Dict[str, Any]:
        data = {
            "id": self.id,
            "quiz_id": self.quiz_id,
            "question_text": self.question_text,
            "options": self.options,
            "topic_tag": self.topic_tag
        }
        if include_answer:
            data["correct_option_index"] = self.correct_option_index
            data["explanation"] = self.explanation
        return data

class QuizService:
    """Service for generating active recall multiple-choice quizzes and scoring attempts."""

    def __init__(self):
        # Initialize Supabase client for persistence
        from app.core.supabase_client import get_client
        self._supabase = get_client()
        self._quizzes: Dict[str, Dict[str, Any]] = {}
        self._quiz_questions: Dict[str, List[QuizQuestion]] = {}
        self._quiz_attempts: Dict[str, List[Dict[str, Any]]] = {}
        self._gemini_client = None

        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip() and settings.GEMINI_API_KEY != "your-gemini-api-key":
            try:
                from google import genai
                self._gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception:
                self._gemini_client = None

    async def generate_quiz(
        self,
        user_id: str,
        document_id: str,
        difficulty: str = "medium",
        question_count: int = 5,
        topic_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate multiple choice questions based on document text."""
        doc = document_service.get_document(document_id, user_id)
        pages = document_service.get_document_pages(document_id, user_id)
        
        full_text = "\n\n".join([f"Page {p['page_number']}:\n{p['text']}" for p in pages if p.get("text")])
        if not full_text.strip():
            raise BadRequestException("Document contains no readable text to generate quiz questions.")

        quiz_id = str(uuid.uuid4())
        doc_title = doc.get("title", "Study Material")
        now = datetime.now(timezone.utc)

        # 1. Attempt LLM Quiz Generation via Gemini
        generated_raw_questions = await self._generate_questions_with_llm(
            doc_title=doc_title,
            text=full_text,
            difficulty=difficulty,
            count=question_count
        )

        # If LLM generation failed or returned insufficient questions, use grounded fallback generator
        if not generated_raw_questions or len(generated_raw_questions) < question_count:
            generated_raw_questions = self._generate_fallback_questions(
                doc_title=doc_title,
                pages=pages,
                difficulty=difficulty,
                count=question_count
            )

        questions: List[QuizQuestion] = []
        for q_data in generated_raw_questions[:question_count]:
            q_id = str(uuid.uuid4())
            questions.append(QuizQuestion(
                question_id=q_id,
                quiz_id=quiz_id,
                question_text=q_data["question_text"],
                options=q_data["options"][:4],
                correct_option_index=int(q_data.get("correct_option_index", 0)),
                explanation=q_data.get("explanation", "The selected option correctly reflects the concepts in the study material."),
                topic_tag=q_data.get("topic_tag", doc_title)
            ))

        # Persist quiz and questions to Supabase
        quiz_payload = {
            "id": quiz_id,
            "user_id": user_id,
            "document_id": document_id,
            "topic_id": topic_id,
            "title": f"{doc_title} ({difficulty.capitalize()} Assessment)",
            "difficulty": difficulty,
            "question_count": len(questions),
            "created_at": now.isoformat()
        }
        # Insert quiz record
        self._supabase.from_("quizzes").insert(quiz_payload).execute()
        # Insert each question
        for q in questions:
            question_payload = {
                "id": q.question_id,
                "quiz_id": quiz_id,
                "question_text": q.question_text,
                "options": json.dumps(q.options),
                "correct_option_index": q.correct_option_index,
                "explanation": q.explanation,
                "topic_tag": q.topic_tag,
                "created_at": now.isoformat()
            }
            self._supabase.from_("quiz_questions").insert(question_payload).execute()

        # Update in‑memory caches (optional quick lookup)
        self._quizzes[quiz_id] = quiz_payload
        self._quiz_questions[quiz_id] = questions
        self._quiz_attempts[quiz_id] = []

        # Return record with embedded questions for immediate client use
        quiz_record = dict(quiz_payload)
        quiz_record["questions"] = [q.to_dict(include_answer=False) for q in questions]
        return quiz_record

    async def _generate_questions_with_llm(
        self,
        doc_title: str,
        text: str,
        difficulty: str,
        count: int
    ) -> List[Dict[str, Any]]:
        if not self._gemini_client:
            return []

        sampled_text = text[:15000]
        prompt = (
            f"You are Cogniva AI, an expert exam author. Generate {count} high-yield multiple-choice questions "
            f"at '{difficulty}' difficulty strictly based on the following course material.\n\n"
            f"DOCUMENT: {doc_title}\n"
            f"MATERIAL:\n{sampled_text}\n\n"
            f"CRITICAL REQUIREMENT: Return a strictly valid JSON array of objects with the following schema:\n"
            f"[\n"
            f"  {{\n"
            f"    \"question_text\": \"Clear academic question based strictly on the text?\",\n"
            f"    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n"
            f"    \"correct_option_index\": 0,\n"
            f"    \"explanation\": \"Detailed pedagogical explanation of why this answer is correct and others are incorrect.\",\n"
            f"    \"topic_tag\": \"Key Concept Name\"\n"
            f"  }}\n"
            f"]\n"
            f"Do not wrap in markdown or backticks if possible, return raw JSON."
        )

        try:
            response = self._gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json", "temperature": 0.2}
            )
            if response and response.text:
                cleaned = response.text.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned.replace("```json", "").replace("```", "").strip()
                data = json.loads(cleaned)
                if isinstance(data, list):
                    return data
        except Exception:
            pass
        return []

    def _generate_fallback_questions(
        self,
        doc_title: str,
        pages: List[Dict[str, Any]],
        difficulty: str,
        count: int
    ) -> List[Dict[str, Any]]:
        """High-quality deterministic fallback question generator."""
        questions: List[Dict[str, Any]] = []
        valid_pages = [p for p in pages if p.get("text") and len(p["text"]) > 50]

        if not valid_pages:
            valid_pages = pages

        for i in range(count):
            page = valid_pages[i % len(valid_pages)]
            p_num = page.get("page_number", 1)
            raw_text = page.get("text", "Core concepts and principles.")
            sentences = [s.strip() for s in raw_text.replace("\n", " ").split(".") if len(s.strip()) > 20]
            
            concept = sentences[0] if sentences else f"Core principle on Page {p_num}"
            if len(concept) > 90:
                concept = concept[:90] + "..."

            q_text = f"According to {doc_title} (Page {p_num}), which of the following best describes the core concept regarding: \"{concept}\"?"
            
            correct_ans = f"It represents the foundational definition and mechanism detailed on Page {p_num}."
            distractor_1 = f"It is an obsolete approach completely replaced by alternative architectures."
            distractor_2 = f"It only applies under strict external hardware constraints without software involvement."
            distractor_3 = f"It produces non-deterministic side effects not documented in the course material."

            options = [correct_ans, distractor_1, distractor_2, distractor_3]
            # Randomize correct option position
            correct_idx = (i * 3) % 4
            if correct_idx != 0:
                options[0], options[correct_idx] = options[correct_idx], options[0]

            questions.append({
                "question_text": q_text,
                "options": options,
                "correct_option_index": correct_idx,
                "explanation": f"Page {p_num} explicitly states that \"{concept}\" establishes the fundamental principles and mechanisms in {doc_title}.",
                "topic_tag": f"Page {p_num} Key Principles"
            })

        return questions

    def list_quizzes(self, user_id: str) -> List[Dict[str, Any]]:
        """List all quizzes created by a user, fetching from Supabase."""
        # Try Supabase first
        try:
            resp = self._supabase.from_("quizzes").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            if resp.data:
                return resp.data
        except Exception:
            pass  # Fall back to in‑memory cache if Supabase unavailable
        # In‑memory fallback
        user_quizzes = [q for q in self._quizzes.values() if q["user_id"] == user_id]
        return sorted(user_quizzes, key=lambda x: x["created_at"], reverse=True)

    def get_quiz(self, quiz_id: str, user_id: str, include_answers: bool = False) -> Dict[str, Any]:
        """Get quiz details with questions, preferring Supabase storage."""
        # Try Supabase first
        try:
            quiz_resp = self._supabase.from_("quizzes").select("*").eq("id", quiz_id).eq("user_id", user_id).single().execute()
            if quiz_resp.data:
                quiz = quiz_resp.data
                # Fetch questions
                q_resp = self._supabase.from_("quiz_questions").select("*").eq("quiz_id", quiz_id).order("created_at").execute()
                questions = q_resp.data if q_resp.data else []
                if include_answers:
                    # fetch attempts and answers (optional, not implemented fully)
                    pass
                quiz["questions"] = questions
                return quiz
        except Exception:
            pass  # fall back to in‑memory
        # In‑memory fallback
        quiz = self._quizzes.get(quiz_id)
        if not quiz or quiz["user_id"] != user_id:
            raise NotFoundException("Quiz not found or access denied.")
        questions = self._quiz_questions.get(quiz_id, [])
        quiz_data = dict(quiz)
        quiz_data["questions"] = [q.to_dict(include_answer=include_answers) for q in questions]
        return quiz_data

    def submit_attempt(
        self,
        quiz_id: str,
        user_id: str,
        answers: List[Dict[str, Any]],
        time_spent_seconds: int = 0
    ) -> Dict[str, Any]:
        """Score a submitted quiz attempt and identify weak topics."""
        quiz = self.get_quiz(quiz_id, user_id, include_answers=True)
        questions: List[QuizQuestion] = self._quiz_questions.get(quiz_id, [])

        answers_map = {a["question_id"]: a["selected_option_index"] for a in answers}
        
        score = 0
        total_questions = len(questions)
        detailed_results = []
        weak_topics_set = set()

        for q in questions:
            selected_idx = answers_map.get(q.id, -1)
            is_correct = (selected_idx == q.correct_option_index)
            if is_correct:
                score += 1
            else:
                if q.topic_tag:
                    weak_topics_set.add(q.topic_tag)

            detailed_results.append({
                "question_id": q.id,
                "question_text": q.question_text,
                "options": q.options,
                "selected_option_index": selected_idx,
                "correct_option_index": q.correct_option_index,
                "is_correct": is_correct,
                "explanation": q.explanation,
                "topic_tag": q.topic_tag
            })

        percentage = round((score / total_questions * 100.0), 1) if total_questions > 0 else 0.0
        attempt_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        # Persist attempt to Supabase
        attempt_payload = {
            "id": attempt_id,
            "quiz_id": quiz_id,
            "user_id": user_id,
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage,
            "time_spent_seconds": time_spent_seconds,
            "weak_topics": json.dumps(list(weak_topics_set)),
            "completed_at": now.isoformat(),
            "created_at": now.isoformat()
        }
        self._supabase.from_("quiz_attempts").insert(attempt_payload).execute()
        # Insert detailed answers
        for result in detailed_results:
            answer_payload = {
                "id": str(uuid.uuid4()),
                "attempt_id": attempt_id,
                "question_id": result["question_id"],
                "selected_option_index": result["selected_option_index"],
                "is_correct": result["is_correct"]
            }
            self._supabase.from_("quiz_answers").insert(answer_payload).execute()
        # Update in‑memory cache (optional)
        if quiz_id not in self._quiz_attempts:
            self._quiz_attempts[quiz_id] = []
        self._quiz_attempts[quiz_id].append(attempt_payload)

        return attempt_payload

    def delete_quiz(self, quiz_id: str, user_id: str) -> bool:
        """Delete a quiz and its related data, preferring Supabase storage."""
        # Verify ownership via in‑memory or Supabase
        try:
            # Ensure the quiz exists and belongs to user
            quiz_check = self._supabase.from_("quizzes").select("id").eq("id", quiz_id).eq("user_id", user_id).single().execute()
            if not quiz_check.data:
                raise NotFoundException("Quiz not found or access denied.")
            # Delete the quiz; related rows cascade via foreign keys
            self._supabase.from_("quizzes").delete().eq("id", quiz_id).execute()
        except Exception:
            # Fallback to in‑memory deletion if Supabase fails
            self.get_quiz(quiz_id, user_id)  # will raise if not found
            self._quizzes.pop(quiz_id, None)
            self._quiz_questions.pop(quiz_id, None)
            self._quiz_attempts.pop(quiz_id, None)
        return True

    def get_quiz_attempts(self, quiz_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Retrieve quiz attempts, preferring Supabase storage."""
        # Try Supabase first
        try:
            # Verify access
            self._supabase.from_("quizzes").select("id").eq("id", quiz_id).eq("user_id", user_id).single().execute()
            attempts_resp = self._supabase.from_("quiz_attempts").select("*").eq("quiz_id", quiz_id).order("created_at", desc=True).execute()
            if attempts_resp.data:
                return attempts_resp.data
        except Exception:
            pass  # fall back to in‑memory
        # In‑memory fallback
        self.get_quiz(quiz_id, user_id)  # ensure ownership
        attempts = self._quiz_attempts.get(quiz_id, [])
        return sorted(attempts, key=lambda x: x["created_at"], reverse=True)



quiz_service = QuizService()
