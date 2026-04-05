"""
Celery application for ISEP Workflow Service (SRS-04 §5).
Uses Redis as broker and result backend.
"""
from celery import Celery
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str | None = None

    class Config:
        env_prefix = ""
        env_file = ".env"


settings = Settings()
broker = settings.celery_broker_url or settings.redis_url

celery_app = Celery(
    "workflow",
    broker=broker,
    backend=settings.redis_url,
    include=["app.tasks"],
)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    worker_prefetch_multiplier=1,
)
