from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENVIRONMENT: str = Field(default="development")
    PORT: int = Field(default=8000)
    ALLOWED_ORIGINS: str = Field(default="http://localhost:5173,http://127.0.0.1:5173")
    
    SUPABASE_URL: str = Field(default="https://placeholder.supabase.co")
    SUPABASE_KEY: str = Field(default="placeholder-key")
    SUPABASE_JWT_SECRET: str = Field(default="placeholder-jwt-secret")
    DATABASE_URL: str = Field(default="")
    
    GEMINI_API_KEY: str = Field(default="")
    
    MAX_UPLOAD_SIZE_MB: int = Field(default=20)
    UPLOAD_DIR: str = Field(default="./uploads")
    
    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
