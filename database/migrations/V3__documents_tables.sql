-- Documents schema (SRS-06 §4.4, entity 2.6–2.7)

CREATE TABLE documents.documents (
    document_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id          UUID REFERENCES core.meetings(meeting_id),
    agenda_item_id      UUID REFERENCES core.agenda_items(agenda_item_id),
    body_id             UUID REFERENCES core.international_bodies(body_id),
    document_type       VARCHAR(50) NOT NULL
                        CHECK (document_type IN (
                            'AGENDA_PAPER', 'WORKING_DOCUMENT', 'SUBMISSION',
                            'REFERENCE', 'INTERVENTION', 'MINUTES',
                            'COUNTRY_POSITION', 'OTHER'
                        )),
    title               VARCHAR(1000) NOT NULL,
    source              VARCHAR(50) NOT NULL
                        CHECK (source IN (
                            'INDIA', 'IMO_SECRETARIAT',
                            'OTHER_MEMBER_STATE', 'OTHER'
                        )),
    minio_bucket        VARCHAR(255) NOT NULL,
    minio_object_key     VARCHAR(1000) NOT NULL,
    file_name           VARCHAR(500) NOT NULL,
    file_size_bytes      BIGINT NOT NULL,
    mime_type           VARCHAR(100) NOT NULL,
    checksum_sha256     CHAR(64) NOT NULL,
    current_version     INTEGER NOT NULL DEFAULT 1,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'SUPERSEDED', 'ARCHIVED', 'LOCKED')),
    is_downloadable     BOOLEAN NOT NULL DEFAULT TRUE,
    metadata            JSONB DEFAULT '{}',
    uploaded_by         UUID NOT NULL REFERENCES core.users(user_id),
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_meeting_id ON documents.documents(meeting_id);
CREATE INDEX idx_documents_agenda_item_id ON documents.documents(agenda_item_id);
CREATE INDEX idx_documents_status ON documents.documents(status);
CREATE INDEX idx_documents_metadata ON documents.documents USING gin(metadata);
CREATE INDEX idx_documents_checksum ON documents.documents(checksum_sha256);

CREATE TABLE documents.document_versions (
    version_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id      UUID NOT NULL REFERENCES documents.documents(document_id),
    version_number   INTEGER NOT NULL,
    minio_object_key VARCHAR(1000) NOT NULL,
    uploaded_by      UUID NOT NULL REFERENCES core.users(user_id),
    uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    change_summary   TEXT,
    file_size_bytes  BIGINT NOT NULL,
    checksum_sha256  CHAR(64) NOT NULL
);

CREATE INDEX idx_document_versions_document_id ON documents.document_versions(document_id);
