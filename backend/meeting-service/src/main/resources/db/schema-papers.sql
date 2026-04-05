-- Papers table for SCR-PAPER-02. Prefer running the central migration instead:
--   From repo root: PGPASSWORD=isep_dev_password psql -h localhost -p 5433 -U isep_app -d isep -f database/migrations/V9__papers.sql
-- If using Docker Compose, Postgres is on host port 5433 (container 5432). Without Docker, use -h localhost -p 5432 if Postgres runs locally.

CREATE TABLE IF NOT EXISTS core.papers (
    paper_id UUID PRIMARY KEY,
    meeting_id UUID REFERENCES core.meetings(meeting_id),
    agenda_item_id UUID REFERENCES core.agenda_items(agenda_item_id),
    title VARCHAR(500),
    status VARCHAR(50) DEFAULT 'DRAFT',
    draft_content TEXT,
    draft_version INT NOT NULL DEFAULT 0,
    draft_saved_at TIMESTAMPTZ,
    draft_last_modified_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

COMMENT ON TABLE core.papers IS 'Formal papers (draft content) for SCR-PAPER-02; one canonical draft per paper.';
