from typing import List, Dict, Any, Tuple
from datetime import datetime

from app.core.supabase_client import get_client
from app.models.schemas import ProgressSummaryResponse


class AnalyticsService:
    """Service for computing user progress, quiz statistics, and weak topic summaries.

    The implementation uses Supabase for data retrieval. If Supabase environment variables are not set,
    the mock client defined in `supabase_client.py` will be used, which stores data in‑memory.
    """

    def __init__(self):
        self._supabase = get_client()

    async def get_progress_summary(self, user_id: str) -> ProgressSummaryResponse:
        """Compute a progress summary for the given user.

        Returns a `ProgressSummaryResponse` with total counts and basic analytics.
        In case of any Supabase error, fallback values of zero are returned.
        """
        # Helper to safely extract count from Supabase response
        def _extract_count(res):
            try:
                return res["count"] if isinstance(res, dict) else len(res)
            except Exception:
                return 0

        # Documents count
        try:
            doc_res = self._supabase.from_("documents").select("id", count="exact").eq("user_id", user_id).execute()
            total_documents = _extract_count(doc_res)
        except Exception:
            total_documents = 0

        # Total quizzes taken (attempts)
        try:
            attempt_res = self._supabase.from_("quiz_attempts").select("id", count="exact").eq("user_id", user_id).execute()
            total_quizzes_taken = _extract_count(attempt_res)
        except Exception:
            total_quizzes_taken = 0

        # Average quiz score (percentage)
        try:
            attempts = self._supabase.from_("quiz_attempts").select("percentage").eq("user_id", user_id).execute()
            percentages = [a["percentage"] for a in attempts] if isinstance(attempts, list) else []
            average_quiz_score = sum(percentages) / len(percentages) if percentages else 0.0
        except Exception:
            average_quiz_score = 0.0

        # Total questions asked – approximate as sum of attempts * question_count per quiz
        try:
            attempts_detail = self._supabase.from_("quiz_attempts").select("quiz_id").eq("user_id", user_id).execute()
            quiz_ids = [a["quiz_id"] for a in attempts_detail] if isinstance(attempts_detail, list) else []
            total_questions_asked = 0
            if quiz_ids:
                quizzes = self._supabase.from_("quizzes").select("id,question_count").in_("id", quiz_ids).execute()
                qp = {q["id"]: q.get("question_count", 0) for q in quizzes} if isinstance(quizzes, list) else {}
                total_questions_asked = sum(qp.get(qid, 0) for qid in quiz_ids)
        except Exception:
            total_questions_asked = 0

        # Weak topics – simple heuristic: topics with <50% average score across attempts
        weak_topics: List[Dict[str, Any]] = []
        try:
            attempts = self._supabase.from_("quiz_attempts").select("id,quiz_id").eq("user_id", user_id).execute()
            for att in attempts:
                answers = self._supabase.from_("quiz_answers").select("question_id,is_correct").eq("attempt_id", att["id"]).execute()
                question_ids = [a["question_id"] for a in answers] if isinstance(answers, list) else []
                if not question_ids:
                    continue
                questions = self._supabase.from_("quiz_questions").select("id,topic_tag").in_("id", question_ids).execute()
                topic_stats: Dict[str, Tuple[int, int]] = {}
                for ans in answers:
                    q = next((q for q in questions if q["id"] == ans["question_id"]), None)
                    if q is None:
                        continue
                    tag = q.get("topic_tag") or "unknown"
                    correct = ans.get("is_correct", False)
                    total, correct_cnt = topic_stats.get(tag, (0, 0))
                    topic_stats[tag] = (total + 1, correct_cnt + (1 if correct else 0))
                for tag, (total, correct_cnt) in topic_stats.items():
                    if total > 0 and (correct_cnt / total) < 0.5:
                        weak_topics.append({"topic": tag, "accuracy": correct_cnt / total})
        except Exception:
            weak_topics = []

        # Score history – list of timestamps and scores
        score_history: List[Dict[str, Any]] = []
        try:
            attempts_hist = self._supabase.from_("quiz_attempts").select("created_at,percentage").eq("user_id", user_id).order("created_at", desc=False).execute()
            for ah in attempts_hist:
                score_history.append({"date": ah.get("created_at"), "score": ah.get("percentage")})
        except Exception:
            score_history = []

        return ProgressSummaryResponse(
            total_documents=total_documents,
            total_questions_asked=total_questions_asked,
            total_quizzes_taken=total_quizzes_taken,
            average_quiz_score=average_quiz_score,
            weak_topics=weak_topics,
            score_history=score_history,
        )

