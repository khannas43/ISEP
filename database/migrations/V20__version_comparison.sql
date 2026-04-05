-- V20 — Clean copy status + change acceptance tracking (TASK-S2-02 Batch 7)
-- Constraint name on documents.documents (pre-V20): documents_status_check (see V17).
-- PK column is document_id (not id).

-- Extend document status: keep existing V17 values + workflow/clean-copy values
ALTER TABLE documents.documents
    DROP CONSTRAINT IF EXISTS documents_status_check;

ALTER TABLE documents.documents
    ADD CONSTRAINT documents_status_check
    CHECK (status IN (
        'ACTIVE', 'SUPERSEDED', 'ARCHIVED', 'LOCKED', 'DRAFT',
        'UNDER_REVIEW', 'APPROVED', 'CLEAN_COPY', 'FINALIZED'
    ));

CREATE TABLE IF NOT EXISTS documents.version_change_decisions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     UUID NOT NULL REFERENCES documents.documents(document_id),
    from_version    INTEGER NOT NULL,
    to_version      INTEGER NOT NULL,
    change_index    INTEGER NOT NULL,
    decision        VARCHAR(10) NOT NULL CHECK (decision IN ('ACCEPTED', 'REJECTED')),
    decided_by      UUID NOT NULL REFERENCES core.users(user_id),
    decided_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (document_id, from_version, to_version, change_index)
);

CREATE INDEX IF NOT EXISTS idx_vcd_document
    ON documents.version_change_decisions(document_id, from_version, to_version);

COMMENT ON TABLE documents.version_change_decisions IS 'Per-chunk accept/reject for version comparison clean copy (TASK-S2-02).';
