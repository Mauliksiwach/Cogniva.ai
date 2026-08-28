from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from app.config import settings
from app.core.auth import get_current_user
from app.models.schemas import APIResponse, AuthenticatedUser, HealthResponse

router = APIRouter(tags=["Authentication & Health"])

@router.get("/health", response_model=APIResponse[HealthResponse])
async def health_check():
    health_data = HealthResponse(
        status="healthy",
        version="1.0.0",
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc),
        services={
            "database": "connected" if settings.SUPABASE_URL else "not_configured",
            "ai_engine": "ready" if settings.GEMINI_API_KEY else "unconfigured"
        }
    )
    return APIResponse(
        success=True,
        message="StudyPilot API is operating normally",
        data=health_data
    )

@router.get("/auth/me", response_model=APIResponse[AuthenticatedUser])
async def get_my_profile(current_user: AuthenticatedUser = Depends(get_current_user)):
    return APIResponse(
        success=True,
        message="Current user profile retrieved successfully",
        data=current_user
    )

@router.post("/auth/verify", response_model=APIResponse[AuthenticatedUser])
async def verify_session(current_user: AuthenticatedUser = Depends(get_current_user)):
    return APIResponse(
        success=True,
        message="Session token is valid",
        data=current_user
    )
