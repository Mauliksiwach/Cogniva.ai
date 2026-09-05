from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from app.core.auth import get_current_user
from app.models.schemas import (
    APIResponse,
    AuthenticatedUser,
    QuizGenerateRequest,
    QuizAttemptRequest
)
from app.services.quiz_service import quiz_service

router = APIRouter(prefix="/quizzes", tags=["Cogniva Quiz"])

@router.post("/generate", response_model=APIResponse[dict], status_code=status.HTTP_201_CREATED)
async def generate_quiz(
    request: QuizGenerateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    quiz = await quiz_service.generate_quiz(
        user_id=current_user.id,
        document_id=request.document_id,
        difficulty=request.difficulty,
        question_count=request.question_count,
        topic_id=request.topic_id
    )
    return APIResponse(
        success=True,
        message=f"Cogniva Quiz '{quiz['title']}' generated successfully with {quiz['question_count']} questions.",
        data=quiz
    )

@router.get("", response_model=APIResponse[List[dict]])
async def list_quizzes(current_user: AuthenticatedUser = Depends(get_current_user)):
    quizzes = quiz_service.list_quizzes(current_user.id)
    return APIResponse(
        success=True,
        message=f"Retrieved {len(quizzes)} quizzes.",
        data=quizzes
    )

@router.get("/{quiz_id}", response_model=APIResponse[dict])
async def get_quiz(
    quiz_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    quiz = quiz_service.get_quiz(quiz_id, current_user.id, include_answers=False)
    return APIResponse(
        success=True,
        message="Quiz details retrieved.",
        data=quiz
    )

@router.post("/{quiz_id}/attempt", response_model=APIResponse[dict])
async def submit_quiz_attempt(
    quiz_id: str,
    request: QuizAttemptRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    attempt_result = quiz_service.submit_attempt(
        quiz_id=quiz_id,
        user_id=current_user.id,
        answers=[a.model_dump() for a in request.answers],
        time_spent_seconds=request.time_spent_seconds
    )
    return APIResponse(
        success=True,
        message=f"Assessment scored: {attempt_result['score']}/{attempt_result['total_questions']} ({attempt_result['percentage']}%)",
        data=attempt_result
    )

@router.get("/{quiz_id}/attempts", response_model=APIResponse[List[dict]])
async def get_quiz_attempts(
    quiz_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    attempts = quiz_service.get_quiz_attempts(quiz_id, current_user.id)
    return APIResponse(
        success=True,
        message=f"Retrieved {len(attempts)} attempts.",
        data=attempts
    )

@router.delete("/{quiz_id}", response_model=APIResponse[dict])
async def delete_quiz(
    quiz_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    quiz_service.delete_quiz(quiz_id, current_user.id)
    return APIResponse(
        success=True,
        message="Quiz successfully deleted.",
        data={"id": quiz_id, "deleted": True}
    )
