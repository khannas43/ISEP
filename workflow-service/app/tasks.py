"""
Celery tasks for ISEP Workflow Service.
Phase 0: one sample task. Reminders and escalation (SRS-03 Module D) in Phase 2.
"""
from app.celery_app import celery_app


@celery_app.task(bind=True)
def sample_task(self, message: str = "hello"):
    """Sample task for Phase 0 — confirms Celery + Redis work."""
    return {"received": message, "task_id": self.request.id}
