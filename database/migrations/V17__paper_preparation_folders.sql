-- V17 — Paper preparation: extend document status (DRAFT), TipTap columns, document_versions editor fields
-- Aligns with ISEP-Cursor-Batch2 Step 8. Existing: documents.documents (document_id PK, meeting_id, agenda_item_id, body_id, …).

ALTER TABLE documents.documents DROP CONSTRAINT IF EXISTS documents_status_check;
ALTER TABLE documents.documents ADD CONSTRAINT documents_status_check CHECK (
    status IN ('ACTIVE', 'SUPERSEDED', 'ARCHIVED', 'LOCKED', 'DRAFT')
);

ALTER TABLE documents.documents
    ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ydoc_state BYTEA;

COMMENT ON COLUMN documents.documents.is_locked IS 'TRUE after paper reaches FINALIZED state. No further edits permitted.';
COMMENT ON COLUMN documents.documents.ydoc_state IS 'Y.js collaborative editor state — binary. Updated on every save.';

ALTER TABLE documents.document_versions
    ADD COLUMN IF NOT EXISTS content_html TEXT,
    ADD COLUMN IF NOT EXISTS ydoc_state BYTEA,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
