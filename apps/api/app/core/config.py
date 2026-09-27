"""
NEXUS API — Core configuration.
Reads all settings from environment variables with sensible defaults for development.
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    # ── App ────────────────────────────────────────────
    APP_NAME: str = "NEXUS"
    APP_VERSION: str = "0.1.0"
    LOG_LEVEL: str = "INFO"
    DEBUG: bool = False

    # ── Database ───────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@127.0.0.1:5444/nexus"
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@127.0.0.1:5444/nexus"

    # ── Auth ───────────────────────────────────────────
    AUTH_SECRET: str = "change-me-in-production"
    AUTH_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # ── CORS ───────────────────────────────────────────
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000"

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: str) -> str:
        return v

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]

    # ── AI Providers ───────────────────────────────────
    LLM_PROVIDER: str = "openai"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o"

    STT_PROVIDER: str = "openai"
    STT_API_KEY: str = ""

    OCR_PROVIDER: str = "tesseract"
    OCR_API_KEY: str = ""

    EMBEDDING_PROVIDER: str = "openai"
    EMBEDDING_API_KEY: str = ""
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536

    # ── Storage ────────────────────────────────────────
    STORAGE_PROVIDER: str = "local"
    STORAGE_PATH: str = "./uploads"

    model_config = {
        "env_file": "../../.env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


settings = Settings()
