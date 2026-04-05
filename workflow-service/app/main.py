"""
ISEP Workflow Service — FastAPI app (SRS-04 §5).
Phase 0: skeleton with health and one sample Celery task.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.tasks import sample_task


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # Shutdown: close connections etc. if needed


app = FastAPI(
    title="ISEP Workflow Service",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "workflow-service"}


@app.get("/api/v1/workflow/ping")
def ping():
    return {"message": "pong"}


@app.post("/api/v1/workflow/sample")
def trigger_sample_task(message: str = "hello"):
    """Trigger the sample Celery task (Phase 0)."""
    result = sample_task.delay(message)
    return {"task_id": result.id, "message": "Task queued"}
