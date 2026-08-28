from typing import List, Optional, Dict, Any, Generic, TypeVar
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[T] = None

class AuthenticatedUser(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str = "authenticated"

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    timestamp: datetime
    services: Dict[str, str]

# Document Schemas
class DocumentBase(BaseModel):
    title: str
    file_name: str
    file_size: int
    file_type: str = "application/pdf"

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: str
    user_id: str
    page_count: int = 0
    processing_status: str = "pending"
    error_message: Optional[str] = None
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Document Chunk Schema
class DocumentChunk(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    page_number: int
    content: str
    metadata: Dict[str, Any] = {}

# Chat & Grounded QA Schemas
class CitationSource(BaseModel):
    document_id: str
    document_title: str
    page_number: int
    snippet: str

class ChatMessageRequest(BaseModel):
    conversation_id: Optional[str] = None
    document_ids: List[str] = Field(min_length=1)
    message: str = Field(min_length=1)

class ChatMessageResponse(BaseModel):
    conversation_id: str
    message_id: str
    role: str = "assistant"
    content: str
    sources: List[CitationSource] = []
    created_at: datetime

# Quiz Schemas
class QuizGenerateRequest(BaseModel):
    document_id: str
    topic_id: Optional[str] = None
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")
    question_count: int = Field(default=5, ge=1, le=20)

class QuizQuestionResponse(BaseModel):
    id: str
    question_text: str
    options: List[str]
    correct_option_index: Optional[int] = None
    explanation: Optional[str] = None
    topic_tag: Optional[str] = None

class QuizResponse(BaseModel):
    id: str
    document_id: str
    title: str
    difficulty: str
    question_count: int
    created_at: datetime
    questions: List[QuizQuestionResponse] = []

class QuizAnswerSubmission(BaseModel):
    question_id: str
    selected_option_index: int

class QuizAttemptRequest(BaseModel):
    quiz_id: str
    answers: List[QuizAnswerSubmission]
    time_spent_seconds: int = 0

class QuizAttemptResponse(BaseModel):
    attempt_id: str
    quiz_id: str
    score: int
    total_questions: int
    percentage: float
    time_spent_seconds: int
    weak_topics: List[str] = []
    detailed_results: List[Dict[str, Any]] = []

# Analytics Schemas
class ProgressSummaryResponse(BaseModel):
    total_documents: int
    total_questions_asked: int
    total_quizzes_taken: int
    average_quiz_score: float
    weak_topics: List[Dict[str, Any]] = []
    score_history: List[Dict[str, Any]] = []
