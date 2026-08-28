from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.models.schemas import APIResponse, AuthenticatedUser, ProgressSummaryResponse

router = APIRouter(prefix="/progress", tags=["Progress & Analytics"])

@router.get("", response_model=APIResponse[ProgressSummaryResponse])
async def get_progress(current_user: AuthenticatedUser = Depends(get_current_user)):
    summary = ProgressSummaryResponse(total_documents=0, total_questions_asked=0, total_quizzes_taken=0, average_quiz_score=0.0, weak_topics=[], score_history=[])
    return APIResponse(success=True, message="Progress retrieved", data=summary)
