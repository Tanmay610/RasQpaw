import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ResQPaw API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    DATABASE_URL: str = "sqlite:///./resqpaw.db"
    AI_API_KEY: str | None = None
    GROK_API_KEY: str | None = None
    OPENROUTER_API_KEY: str | None = None

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
