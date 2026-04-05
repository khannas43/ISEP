-- V18 — Multi-assignee tasks, escalation, status alignment (A-D-01, A-D-03)
-- Tasks table is core.tasks (see V4), not workflow.tasks.

CREATE TABLE IF NOT EXISTS core.task_assignees (
    task_id     UUID NOT NULL REFERENCES core.tasks(task_id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES core.users(user_id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_assignees_user ON core.task_assignees(user_id);

ALTER TABLE core.tasks ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ;
ALTER TABLE core.tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES core.users(user_id);

-- Extend status values; migrate legacy rows
ALTER TABLE core.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

UPDATE core.tasks SET status = 'PENDING' WHERE status IN ('CREATED', 'ASSIGNED');
UPDATE core.tasks SET status = 'COMPLETED' WHERE status IN ('SUBMITTED', 'REVIEWED', 'CLOSED');

ALTER TABLE core.tasks ADD CONSTRAINT tasks_status_check CHECK (
    status IN (
        'PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED', 'OVERDUE', 'CANCELLED'
    )
);

-- Backfill assignees from legacy single assignee
INSERT INTO core.task_assignees (task_id, user_id)
SELECT task_id, assigned_to FROM core.tasks
WHERE assigned_to IS NOT NULL
ON CONFLICT DO NOTHING;

UPDATE core.tasks SET created_by = assigned_by WHERE created_by IS NULL AND assigned_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_agenda_item ON core.tasks(agenda_item_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_due ON core.tasks(status, due_date);
