from fastapi import APIRouter
from app.api.v1.endpoints import auth, documents, chat, quizzes, analytics

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth.router)
api_v1_router.include_router(documents.router)
api_v1_router.include_router(chat.router)
api_v1_router.include_router(quizzes.router)
api_v1_router.include_router(analytics.router)
