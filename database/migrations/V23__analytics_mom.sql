-- V23 — Minutes of Meeting + analytics snapshots (Phase 6)

CREATE TABLE IF NOT EXISTS documents.minutes_of_meeting (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id      UUID NOT NULL REFERENCES core.meetings(meeting_id),
    generated_by    UUID NOT NULL REFERENCES core.users(user_id),
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attendee_count  INTEGER,
    agenda_items_covered INTEGER,
    decisions_text  TEXT,
    action_items    JSONB,
    content_html    TEXT,
    content_json    JSONB,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT','FINALISED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (meeting_id)
);

CREATE TABLE IF NOT EXISTS documents.analytics_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id      UUID REFERENCES core.meetings(meeting_id),
    snapshot_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    total_members   INTEGER NOT NULL DEFAULT 0,
    participated    INTEGER NOT NULL DEFAULT 0,
    tasks_total     INTEGER NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    tasks_overdue   INTEGER NOT NULL DEFAULT 0,
    papers_draft    INTEGER NOT NULL DEFAULT 0,
    papers_approved INTEGER NOT NULL DEFAULT 0,
    papers_finalised INTEGER NOT NULL DEFAULT 0,
    avg_approval_days NUMERIC(5,1),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mom_meeting
    ON documents.minutes_of_meeting(meeting_id);
CREATE INDEX IF NOT EXISTS idx_analytics_meeting
    ON documents.analytics_snapshots(meeting_id, snapshot_date DESC);
