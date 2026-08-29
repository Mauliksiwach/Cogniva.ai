import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from app.core.auth import get_current_user
from app.core.exceptions import BadRequestException, NotFoundException
from app.models.schemas import (
    APIResponse,
    AuthenticatedUser,
    ChatMessageRequest,
    ChatMessageResponse,
    CitationSource
)
from app.services.retrieval_service import retrieval_service
from app.services.ai_service import ai_service
from app.services.document_service import document_service

router = APIRouter(prefix="/chat", tags=["Study Assistant Chat"])

# In-memory storage for conversations and messages (mirrors Supabase schema)
_conversations: Dict[str, Dict[str, Any]] = {}
_messages: Dict[str, List[Dict[str, Any]]] = {}

@router.post("", response_model=APIResponse[ChatMessageResponse])
async def send_chat_message(
    request: ChatMessageRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    if not request.document_ids:
        raise BadRequestException("Please select at least one study material/document to ask questions about.")

    if not request.message.strip():
        raise BadRequestException("Message cannot be empty.")

    # Validate that user owns all selected documents
    for doc_id in request.document_ids:
        document_service.get_document(doc_id, current_user.id)

    # 1. Manage Conversation Session
    conversation_id = request.conversation_id or str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    if conversation_id not in _conversations:
        first_doc = document_service.get_document(request.document_ids[0], current_user.id)
        title_snippet = request.message[:35] + ("..." if len(request.message) > 35 else "")
        _conversations[conversation_id] = {
            "id": conversation_id,
            "user_id": current_user.id,
            "title": f"Study: {title_snippet}",
            "document_ids": request.document_ids,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        _messages[conversation_id] = []

    # 2. Record User Message
    user_msg_id = str(uuid.uuid4())
    _messages[conversation_id].append({
        "id": user_msg_id,
        "conversation_id": conversation_id,
        "user_id": current_user.id,
        "role": "user",
        "content": request.message.strip(),
        "sources": [],
        "created_at": now.isoformat()
    })

    # 3. Retrieve relevant chunks across selected documents
    scored_chunks = retrieval_service.retrieve_relevant_chunks(
        user_id=current_user.id,
        document_ids=request.document_ids,
        query=request.message,
        top_k=4
    )

    # 4. Generate Grounded AI Response
    ai_result = await ai_service.answer_question(
        query=request.message,
        scored_chunks=scored_chunks
    )

    # 5. Record Assistant Message
    assistant_msg_id = str(uuid.uuid4())
    assistant_msg_record = {
        "id": assistant_msg_id,
        "conversation_id": conversation_id,
        "user_id": current_user.id,
        "role": "assistant",
        "content": ai_result["content"],
        "sources": ai_result["sources"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    _messages[conversation_id].append(assistant_msg_record)

    _conversations[conversation_id]["updated_at"] = datetime.now(timezone.utc).isoformat()

    response_data = ChatMessageResponse(
        conversation_id=conversation_id,
        message_id=assistant_msg_id,
        role="assistant",
        content=ai_result["content"],
        sources=[
            CitationSource(
                document_id=s["document_id"],
                document_title=s["document_title"],
                page_number=s["page_number"],
                snippet=s["snippet"]
            )
            for s in ai_result["sources"]
        ],
        created_at=datetime.now(timezone.utc)
    )

    return APIResponse(
        success=True,
        message="Grounded answer generated successfully",
        data=response_data
    )

@router.get("/conversations", response_model=APIResponse[List[dict]])
async def list_conversations(current_user: AuthenticatedUser = Depends(get_current_user)):
    user_convs = [
        c for c in _conversations.values()
        if c["user_id"] == current_user.id
    ]
    user_convs.sort(key=lambda x: x["updated_at"], reverse=True)
    return APIResponse(
        success=True,
        message=f"Retrieved {len(user_convs)} study conversations.",
        data=user_convs
    )

@router.get("/conversations/{conversation_id}/messages", response_model=APIResponse[List[dict]])
async def get_conversation_messages(
    conversation_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    conv = _conversations.get(conversation_id)
    if not conv or conv["user_id"] != current_user.id:
        raise NotFoundException("Conversation not found or access denied.")

    msgs = _messages.get(conversation_id, [])
    return APIResponse(
        success=True,
        message=f"Retrieved {len(msgs)} messages.",
        data=msgs
    )

@router.post("/summarize/{document_id}", response_model=APIResponse[dict])
async def summarize_document(
    document_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    doc = document_service.get_document(document_id, current_user.id)
    pages = document_service.get_document_pages(document_id, current_user.id)

    summary = await ai_service.generate_document_summary(
        doc_title=doc.get("title", "Document"),
        pages=pages
    )

    return APIResponse(
        success=True,
        message=f"Generated summary for '{doc['title']}'.",
        data={
            "document_id": document_id,
            "title": doc.get("title"),
            "summary": summary
        }
    )
