from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.models.schemas import APIResponse, AuthenticatedUser, ChatMessageRequest, ChatMessageResponse

router = APIRouter(prefix="/chat", tags=["Study Assistant Chat"])

@router.post("", response_model=APIResponse[ChatMessageResponse])
async def send_chat_message(request: ChatMessageRequest, current_user: AuthenticatedUser = Depends(get_current_user)):
    return APIResponse(success=True, message="Message processed", data=None)
