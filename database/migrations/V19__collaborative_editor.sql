-- V19 — Collaborative editor (TipTap Layer 1): document body + version snapshots
-- Extends existing documents.documents and documents.document_versions (V3, V17).
-- Note: documents.documents PK is document_id (not id). document_versions uses version_id.

-- Current editor state on the document row
ALTER TABLE documents.documents
    ADD COLUMN IF NOT EXISTS content_html TEXT,
    ADD COLUMN IF NOT EXISTS content_json JSONB,
    ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ydoc_state BYTEA;

COMMENT ON COLUMN documents.documents.content_html IS 'Latest TipTap HTML snapshot.';
COMMENT ON COLUMN documents.documents.content_json IS 'Latest TipTap JSON document.';
COMMENT ON COLUMN documents.documents.is_locked IS 'TRUE when finalised; no further edits.';
COMMENT ON COLUMN documents.documents.ydoc_state IS 'Y.js binary state (Layer 3).';

-- Snapshot rows may be editor-only (no binary file)
ALTER TABLE documents.document_versions
    ADD COLUMN IF NOT EXISTS content_json JSONB;

-- V17 may have added content_html / ydoc_state / deleted_at to document_versions
ALTER TABLE documents.document_versions
    ADD COLUMN IF NOT EXISTS content_html TEXT;

ALTER TABLE documents.document_versions
    ADD COLUMN IF NOT EXISTS ydoc_state BYTEA;

ALTER TABLE documents.document_versions
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Allow editor snapshots without MinIO file fields
ALTER TABLE documents.document_versions
    ALTER COLUMN minio_object_key DROP NOT NULL;

ALTER TABLE documents.document_versions
    ALTER COLUMN file_size_bytes DROP NOT NULL;

ALTER TABLE documents.document_versions
    ALTER COLUMN checksum_sha256 DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_doc_versions_unique
    ON documents.document_versions(document_id, version_number);

COMMENT ON TABLE documents.document_versions IS
    'Version history: file uploads and/or TipTap editor snapshots.';
