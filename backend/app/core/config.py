import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AML Detection & Graph Analytics Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

    # PostgreSQL / Database Configuration
    # Defaults to PostgreSQL, with automatic SQLite fallback for local test/dev without a live PG service
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./aml_dev.db"  # Defaults to local dev SQLite, override with PostgreSQL in production/.env
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        if isinstance(v, str):
            # Railway and Heroku inject 'postgres://' which SQLAlchemy 2.0 does not recognize
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+psycopg2://", 1)
            elif v.startswith("postgresql://") and not v.startswith("postgresql+"):
                return v.replace("postgresql://", "postgresql+psycopg2://", 1)
        return v
    
    # DB Pool settings (for PostgreSQL)
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_PRE_PING: bool = True
    
    # AML Alert Thresholds
    SUSPICIOUS_THRESHOLD_HIGH: float = 0.70
    SUSPICIOUS_THRESHOLD_MEDIUM: float = 0.40
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8501",  # Streamlit default port
        "http://127.0.0.1:8501",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

    # Plugins settings
    DEFAULT_ACTIVE_PLUGINS: List[str] = [
        "heuristic_rules",
        "xgboost_classifier",
        "autoencoder_anomaly",
        "graph_ring_detector"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
