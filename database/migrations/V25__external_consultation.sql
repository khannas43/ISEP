-- V25 — External agency consultation (Phase 4)

ALTER TABLE core.users
    ADD COLUMN IF NOT EXISTS is_external BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE core.papers
    ADD COLUMN IF NOT EXISTS clean_copy_document_id UUID REFERENCES documents.documents(document_id);

-- Idempotent demo document 201 (aligns with scripts/demo-seed.sql) for DBs that only run Flyway
INSERT INTO documents.documents (
    document_id, meeting_id, agenda_item_id, document_type, title, source,
    minio_bucket, minio_object_key, file_name, file_size_bytes, mime_type, checksum_sha256,
    current_version, status, uploaded_by, uploaded_at, created_at, updated_at
)
SELECT
    '00000000-0000-0000-0000-000000000201'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000101'::uuid,
    'COUNTRY_POSITION',
    'India Position Paper — MARPOL Annex VI Amendments',
    'INDIA',
    'isep-demo',
    'demo/00000000-0000-0000-0000-000000000201/v2.pdf',
    'India-MARPOL-AnnexVI-MSC108.pdf',
    2048,
    'application/pdf',
    repeat('a', 64)::char(64),
    2,
    'ACTIVE',
    u.user_id,
    NOW(), NOW(), NOW()
FROM (SELECT user_id FROM core.users WHERE is_active = true ORDER BY created_at LIMIT 1) u
WHERE EXISTS (SELECT 1 FROM core.meetings WHERE meeting_id = '00000000-0000-0000-0000-000000000001'::uuid)
  AND EXISTS (SELECT 1 FROM core.agenda_items WHERE agenda_item_id = '00000000-0000-0000-0000-000000000101'::uuid)
ON CONFLICT (document_id) DO NOTHING;

UPDATE core.papers
SET clean_copy_document_id = '00000000-0000-0000-0000-000000000201'::uuid
WHERE paper_id = '00000000-0000-0000-0000-000000000501'::uuid
  AND EXISTS (SELECT 1 FROM documents.documents WHERE document_id = '00000000-0000-0000-0000-000000000201'::uuid);

CREATE TABLE IF NOT EXISTS documents.consultations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     UUID NOT NULL REFERENCES documents.documents(document_id),
    sent_by         UUID NOT NULL REFERENCES core.users(user_id),
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deadline        DATE,
    notes           TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN','COMPLETED','EXPIRED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_document_id ON documents.consultations(document_id);

CREATE TABLE IF NOT EXISTS documents.consultation_agencies (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id       UUID NOT NULL REFERENCES documents.consultations(id) ON DELETE CASCADE,
    agency_user_id        UUID NOT NULL REFERENCES core.users(user_id),
    agency_name           VARCHAR(255) NOT NULL,
    status                VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','VIEWED','FEEDBACK_SUBMITTED')),
    feedback_html         TEXT,
    feedback_submitted_at TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (consultation_id, agency_user_id)
);

CREATE INDEX IF NOT EXISTS idx_consultation_agencies_consultation_id ON documents.consultation_agencies(consultation_id);

INSERT INTO core.users (user_id, keycloak_id, email, full_name,
    system_role, organization, is_external, is_active, created_at, updated_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001','moefcc-rep',
   'moefcc-rep@demo.isep.gov.in','MoEFCC Representative',
   'MEMBER','Ministry of Environment, Forest & Climate Change',
   true,true,NOW(),NOW()),
  ('a1000000-0000-0000-0000-000000000002','mea-rep',
   'mea-rep@demo.isep.gov.in','MEA Representative',
   'MEMBER','Ministry of External Affairs',
   true,true,NOW(),NOW()),
  ('a1000000-0000-0000-0000-000000000003','mod-rep',
   'mod-rep@demo.isep.gov.in','MoD Representative',
   'MEMBER','Ministry of Defence',
   true,true,NOW(),NOW()),
  ('a1000000-0000-0000-0000-000000000004','mos-rep',
   'mos-rep@demo.isep.gov.in','MoS Representative',
   'MEMBER','Ministry of Steel',
   true,true,NOW(),NOW()),
  ('a1000000-0000-0000-0000-000000000005','mopng-rep',
   'mopng-rep@demo.isep.gov.in','MoPNG Representative',
   'MEMBER','Ministry of Petroleum & Natural Gas',
   true,true,NOW(),NOW())
ON CONFLICT (keycloak_id) DO NOTHING;

INSERT INTO core.meeting_participants (participant_id, meeting_id, user_id, meeting_role, assigned_at)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, user_id, 'MEMBER', NOW()
FROM core.users
WHERE keycloak_id IN
  ('moefcc-rep','mea-rep','mod-rep','mos-rep','mopng-rep')
ON CONFLICT (meeting_id, user_id) DO NOTHING;

INSERT INTO documents.consultations
  (id, document_id, sent_by, sent_at, deadline, notes, status)
SELECT
  'c0000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000201'::uuid,
  (SELECT user_id FROM core.users WHERE system_role = 'DELEGATION_LEADER' AND is_active = true LIMIT 1),
  NOW() - INTERVAL '1 day',
  CURRENT_DATE + 5,
  'Please review and provide feedback on India''s position on MARPOL Annex VI amendments.',
  'OPEN'
WHERE EXISTS (SELECT 1 FROM documents.documents WHERE document_id = '00000000-0000-0000-0000-000000000201'::uuid)
  AND EXISTS (SELECT 1 FROM core.users WHERE system_role = 'DELEGATION_LEADER' AND is_active = true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO documents.consultation_agencies
  (consultation_id, agency_user_id, agency_name, status, feedback_submitted_at, feedback_html)
SELECT 'c0000000-0000-0000-0000-000000000001'::uuid,
   'a1000000-0000-0000-0000-000000000001'::uuid,
   'Ministry of Environment, Forest & Climate Change',
   'FEEDBACK_SUBMITTED', NOW() - INTERVAL '6 hours',
   '<p>MoEFCC supports India''s position. Recommend adding reference to
   the National Action Plan on Climate Change in paragraph 2.</p>'
WHERE EXISTS (SELECT 1 FROM documents.consultations WHERE id = 'c0000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT (consultation_id, agency_user_id) DO NOTHING;

INSERT INTO documents.consultation_agencies
  (consultation_id, agency_user_id, agency_name, status, feedback_submitted_at, feedback_html)
SELECT 'c0000000-0000-0000-0000-000000000001'::uuid,
   'a1000000-0000-0000-0000-000000000002'::uuid,
   'Ministry of External Affairs',
   'FEEDBACK_SUBMITTED', NOW() - INTERVAL '4 hours',
   '<p>MEA concurs. Ensure language is consistent with India''s
   UNFCCC submissions on maritime emissions.</p>'
WHERE EXISTS (SELECT 1 FROM documents.consultations WHERE id = 'c0000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT (consultation_id, agency_user_id) DO NOTHING;

INSERT INTO documents.consultation_agencies
  (consultation_id, agency_user_id, agency_name, status, feedback_submitted_at, feedback_html)
SELECT 'c0000000-0000-0000-0000-000000000001'::uuid,
   'a1000000-0000-0000-0000-000000000003'::uuid,
   'Ministry of Defence','VIEWED', NULL, NULL
WHERE EXISTS (SELECT 1 FROM documents.consultations WHERE id = 'c0000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT (consultation_id, agency_user_id) DO NOTHING;

INSERT INTO documents.consultation_agencies
  (consultation_id, agency_user_id, agency_name, status, feedback_submitted_at, feedback_html)
SELECT 'c0000000-0000-0000-0000-000000000001'::uuid,
   'a1000000-0000-0000-0000-000000000004'::uuid,
   'Ministry of Steel','PENDING', NULL, NULL
WHERE EXISTS (SELECT 1 FROM documents.consultations WHERE id = 'c0000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT (consultation_id, agency_user_id) DO NOTHING;

INSERT INTO documents.consultation_agencies
  (consultation_id, agency_user_id, agency_name, status, feedback_submitted_at, feedback_html)
SELECT 'c0000000-0000-0000-0000-000000000001'::uuid,
   'a1000000-0000-0000-0000-000000000005'::uuid,
   'Ministry of Petroleum & Natural Gas','PENDING', NULL, NULL
WHERE EXISTS (SELECT 1 FROM documents.consultations WHERE id = 'c0000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT (consultation_id, agency_user_id) DO NOTHING;
