"""
Core configuration settings for the HRMS Lite backend.
Uses pydantic-settings for environment variable management.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = ""

    # OpenRouter Configuration
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL: str = ""

    # Application
    SECRET_KEY: str = ""
    DEBUG: bool = False
    ALLOWED_ORIGINS: str = ""
    ALLOWED_ORIGIN_REGEX: str = ""

    # Demo isolation (no-auth demo mode)
    DEMO_ISOLATION_ENABLED: bool = False
    DEMO_ISOLATION_MODE: str = "device"  # device | ip

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    @property
    def cors_origins(self) -> List[str]:
        """Parse ALLOWED_ORIGINS into a list."""
        def _clean(o: str) -> str:
            o = (o or "").strip()
            if (o.startswith("\"") and o.endswith("\"")) or (o.startswith("'") and o.endswith("'")):
                o = o[1:-1].strip()
            o = o.rstrip("/")
            return o

        origins = [_clean(origin) for origin in self.ALLOWED_ORIGINS.split(",")]
        origins = [o for o in origins if o]

        localhost_defaults = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
        for o in localhost_defaults:
            if o not in origins:
                origins.append(o)

        return origins

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
