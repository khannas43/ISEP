-- V27 — Restore compatibility for hosted DB dumps that predate newer app columns.
-- Safe to rerun: all columns/tables/indexes use IF NOT EXISTS where supported.

ALTER TABLE core.meetings
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES core.users(user_id),
    ADD COLUMN IF NOT EXISTS live_session_active BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS live_session_started_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS core.task_assignees (
    task_id     UUID NOT NULL REFERENCES core.tasks(task_id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES core.users(user_id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (task_id, user_id)
);

ALTER TABLE core.tasks
    ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES core.users(user_id);

ALTER TABLE core.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

UPDATE core.tasks SET status = 'PENDING' WHERE status IN ('CREATED', 'ASSIGNED');
UPDATE core.tasks SET status = 'COMPLETED' WHERE status IN ('SUBMITTED', 'REVIEWED', 'CLOSED');

ALTER TABLE core.tasks ADD CONSTRAINT tasks_status_check CHECK (
    status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED', 'OVERDUE', 'CANCELLED')
);

INSERT INTO core.task_assignees (task_id, user_id)
SELECT task_id, assigned_to FROM core.tasks
WHERE assigned_to IS NOT NULL
ON CONFLICT DO NOTHING;

UPDATE core.tasks SET created_by = assigned_by WHERE created_by IS NULL AND assigned_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_task_assignees_user ON core.task_assignees(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_agenda_item ON core.tasks(agenda_item_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_due ON core.tasks(status, due_date);

ALTER TABLE documents.documents
    ADD COLUMN IF NOT EXISTS content_html TEXT,
    ADD COLUMN IF NOT EXISTS content_json JSONB,
    ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ydoc_state BYTEA;

ALTER TABLE documents.document_versions
    ADD COLUMN IF NOT EXISTS content_html TEXT,
    ADD COLUMN IF NOT EXISTS content_json JSONB,
    ADD COLUMN IF NOT EXISTS ydoc_state BYTEA,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE documents.document_versions
    ALTER COLUMN minio_object_key DROP NOT NULL;

ALTER TABLE documents.document_versions
    ALTER COLUMN file_size_bytes DROP NOT NULL;

ALTER TABLE documents.document_versions
    ALTER COLUMN checksum_sha256 DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_doc_versions_unique
    ON documents.document_versions(document_id, version_number);

CREATE TABLE IF NOT EXISTS collaboration.live_posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id      UUID NOT NULL REFERENCES core.meetings(meeting_id),
    agenda_item_id  UUID REFERENCES core.agenda_items(agenda_item_id),
    posted_by       UUID NOT NULL REFERENCES core.users(user_id),
    content         TEXT NOT NULL,
    post_type       VARCHAR(20) NOT NULL DEFAULT 'COMMENT'
        CHECK (post_type IN ('COMMENT','INTERVENTION','POINT_OF_ORDER','INFORMATION')),
    is_official     BOOLEAN NOT NULL DEFAULT FALSE,
    posted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE core.agenda_items
    ADD COLUMN IF NOT EXISTS discussion_locked BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS discussion_locked_by UUID REFERENCES core.users(user_id),
    ADD COLUMN IF NOT EXISTS discussion_locked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_live_posts_meeting
    ON collaboration.live_posts(meeting_id, posted_at DESC);

CREATE INDEX IF NOT EXISTS idx_live_posts_agenda
    ON collaboration.live_posts(agenda_item_id, posted_at ASC);
