from typing import List
from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.models.schemas import APIResponse, AuthenticatedUser, DocumentResponse

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=APIResponse[List[DocumentResponse]])
async def list_documents(current_user: AuthenticatedUser = Depends(get_current_user)):
    return APIResponse(success=True, message="Documents list retrieved", data=[])
