from typing import List
from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.models.schemas import APIResponse, AuthenticatedUser, QuizResponse

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])

@router.get("", response_model=APIResponse[List[QuizResponse]])
async def list_quizzes(current_user: AuthenticatedUser = Depends(get_current_user)):
    return APIResponse(success=True, message="Quizzes retrieved", data=[])
