from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.models.schemas import APIResponse, AuthenticatedUser, ProgressSummaryResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/progress", tags=["Progress & Analytics"])

@router.get("", response_model=APIResponse[ProgressSummaryResponse])
async def get_progress(current_user: AuthenticatedUser = Depends(get_current_user)):
    service = AnalyticsService()
    summary = await service.get_progress_summary(current_user.id)
    return APIResponse(success=True, message="Progress retrieved", data=summary)
