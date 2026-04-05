# workflow-service

ISEP Workflow Service — FastAPI + Celery + Redis (SRS-04 §5). Phase 0: skeleton with one sample task. FSM and approval workflows in Phase 2.

## Run

1. Start Redis: `docker run -d -p 6379:6379 redis:7-alpine`
2. Copy `.env.example` to `.env` and set `REDIS_URL` / `CELERY_BROKER_URL` if needed.
3. API: `uvicorn app.main:app --reload --port 8090`
4. Worker: `celery -A app.celery_app worker --loglevel=info`
5. (Optional) Beat for scheduled tasks: `celery -A app.celery_app beat --loglevel=info`

## Endpoints

- `GET /health` — health check
- `GET /api/v1/workflow/ping` — ping
- `POST /api/v1/workflow/sample?message=hello` — enqueue sample Celery task

## Phase 2

Add FSM (Python Transitions) for approval workflow and task states; Celery Beat for reminders and escalation.
