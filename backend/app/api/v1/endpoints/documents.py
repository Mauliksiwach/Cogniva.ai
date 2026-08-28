from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from app.core.auth import get_current_user
from app.core.exceptions import BadRequestException
from app.core.security import is_valid_pdf, sanitize_filename
from app.models.schemas import APIResponse, AuthenticatedUser
from app.services.document_service import document_service

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=APIResponse[dict], status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    if not file.filename:
        raise BadRequestException("Missing uploaded filename.")

    clean_filename = sanitize_filename(file.filename)
    if not is_valid_pdf(clean_filename, file.content_type):
        raise BadRequestException("Invalid file format. Only PDF (.pdf) documents are supported.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise BadRequestException("Uploaded PDF file is empty (0 bytes).")

    doc = await document_service.save_and_process_document(
        user_id=current_user.id,
        filename=clean_filename,
        file_bytes=file_bytes,
        title=title
    )

    return APIResponse(
        success=True,
        message=f"Document '{doc['title']}' uploaded and processed ({doc['page_count']} pages indexed).",
        data=doc
    )

@router.get("", response_model=APIResponse[List[dict]])
async def list_documents(current_user: AuthenticatedUser = Depends(get_current_user)):
    docs = document_service.list_user_documents(current_user.id)
    return APIResponse(
        success=True,
        message=f"Retrieved {len(docs)} documents.",
        data=docs
    )

@router.get("/{document_id}", response_model=APIResponse[dict])
async def get_document(
    document_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    doc = document_service.get_document(document_id, current_user.id)
    return APIResponse(
        success=True,
        message="Document details retrieved.",
        data=doc
    )

@router.get("/{document_id}/pages", response_model=APIResponse[List[dict]])
async def get_document_pages(
    document_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    pages = document_service.get_document_pages(document_id, current_user.id)
    return APIResponse(
        success=True,
        message=f"Retrieved {len(pages)} extracted text pages.",
        data=pages
    )

@router.delete("/{document_id}", response_model=APIResponse[dict])
async def delete_document(
    document_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    document_service.delete_document(document_id, current_user.id)
    return APIResponse(
        success=True,
        message="Document successfully deleted.",
        data={"id": document_id, "deleted": True}
    )
