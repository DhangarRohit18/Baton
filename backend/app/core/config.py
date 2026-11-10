import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "BATON AI Knowledge Continuity Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "baton-enterprise-crypto-secret-key-32bytes-secure!")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./baton.db")
    
    # Upload storage directory
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./baton_storage/uploads")
    
    # AI Provider settings
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "hybrid") # hybrid, gemini, openai, heuristic
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    
    # Security & QR Bridge
    QR_BRIDGE_DEFAULT_TTL_HOURS: int = 72
    QR_BRIDGE_SIGNING_SALT: str = os.getenv("QR_BRIDGE_SIGNING_SALT", "baton-qr-salt-981273918237")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
