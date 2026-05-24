-- ISEP Demo Seed Data
-- Run AFTER all migrations (through V21).
-- Safe to re-run: uses ON CONFLICT DO NOTHING / DO UPDATE where applicable.
--
-- Prerequisites:
--   - At least one active row in core.users (Keycloak sync or admin seed).
--   - Review before production use.
--
-- Fixed UUIDs for smoke tests (export after seed):
--   MEETING_ID=00000000-0000-0000-0000-000000000001
--   ITEM_ID=00000000-0000-0000-0000-000000000101
--   DOC_ID=00000000-0000-0000-0000-000000000201
--
-- Conflicts resolved vs Batch 9 draft: core.users uses system_role (not role);
-- meetings require meeting_type; documents use documents.documents columns from V3/V17/V19/V20
-- (no content_html-only row without required file metadata); document_versions use version_id
-- and optional file fields per V19; core.tasks use V18 status values and core.task_assignees.
-- core.tasks: assigned_to and assigned_by are NOT NULL (V4); do not use created_by in INSERTs.
--
-- Demo user IDs (align with Keycloak realm users):
--   admin-sa     c1000000-0000-0000-0000-000000000000
--   co-user      c1000000-0000-0000-0000-000000000001
--   dl-user      c1000000-0000-0000-0000-000000000002
--   member-user  c1000000-0000-0000-0000-000000000004

-- Re-running seed: keep keycloak_id in sync with Keycloak usernames (no-op if rows missing).
UPDATE core.users SET keycloak_id = 'admin-sa' WHERE user_id = 'c1000000-0000-0000-0000-000000000000'::uuid;
UPDATE core.users SET keycloak_id = 'co-user' WHERE user_id = 'c1000000-0000-0000-0000-000000000001'::uuid;
UPDATE core.users SET keycloak_id = 'dl-user' WHERE user_id = 'c1000000-0000-0000-0000-000000000002'::uuid;
UPDATE core.users SET keycloak_id = 'member-user' WHERE user_id = 'c1000000-0000-0000-0000-000000000004'::uuid;

-- Demo body (abbreviation MSC-DEMO to avoid clashing with real MSC rows)
INSERT INTO core.international_bodies (body_id, name, abbreviation, body_type, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000010'::uuid,
  'Maritime Safety Committee (demo seed)',
  'MSC-DEMO',
  'COMMITTEE',
  true,
  NOW(), NOW()
) ON CONFLICT (body_id) DO NOTHING;

INSERT INTO core.meetings (
  meeting_id, body_id, session_number, title, start_date, end_date, location, meeting_type, status, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000010'::uuid,
  'MSC 108',
  'Maritime Safety Committee — 108th Session',
  CURRENT_DATE + 14,
  CURRENT_DATE + 18,
  'IMO Headquarters, London',
  'IN_PERSON',
  'PLANNED',
  NOW(), NOW()
) ON CONFLICT (meeting_id) DO NOTHING;

INSERT INTO core.agenda_items (
  agenda_item_id, meeting_id, item_number, title, description, category, status, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000101'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  '4.1',
  'Amendments to MARPOL Annex VI — Air Pollution Prevention',
  'Consideration of proposed amendments to reduce SOx and NOx emissions from ships.',
  'DISCUSSION',
  'ACTIVE',
  NOW(), NOW()
) ON CONFLICT (agenda_item_id) DO NOTHING;

INSERT INTO core.agenda_items (
  agenda_item_id, meeting_id, item_number, title, description, category, status, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000102'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  '4.2',
  'Guidelines on Onboard Carbon Capture Systems',
  'Review of draft guidelines for installation and operation of CCS on ships.',
  'DISCUSSION',
  'ACTIVE',
  NOW(), NOW()
) ON CONFLICT (agenda_item_id) DO NOTHING;

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
ON CONFLICT (document_id) DO NOTHING;

INSERT INTO documents.document_versions (
  version_id, document_id, version_number, minio_object_key, uploaded_by, uploaded_at,
  change_summary, file_size_bytes, checksum_sha256
)
SELECT
  '00000000-0000-0000-0000-000000000301'::uuid,
  '00000000-0000-0000-0000-000000000201'::uuid,
  1,
  'demo/00000000-0000-0000-0000-000000000201/v1.pdf',
  u.user_id,
  NOW() - INTERVAL '2 hours',
  'Initial draft',
  1024,
  repeat('b', 64)::char(64)
FROM (SELECT user_id FROM core.users WHERE is_active = true ORDER BY created_at LIMIT 1) u
ON CONFLICT (document_id, version_number) DO NOTHING;

INSERT INTO documents.document_versions (
  version_id, document_id, version_number, minio_object_key, uploaded_by, uploaded_at,
  change_summary, file_size_bytes, checksum_sha256
)
SELECT
  '00000000-0000-0000-0000-000000000302'::uuid,
  '00000000-0000-0000-0000-000000000201'::uuid,
  2,
  'demo/00000000-0000-0000-0000-000000000201/v2.pdf',
  u.user_id,
  NOW() - INTERVAL '1 hour',
  'Track changes — strengthened language',
  2048,
  repeat('c', 64)::char(64)
FROM (SELECT user_id FROM core.users WHERE is_active = true ORDER BY created_at LIMIT 1) u
ON CONFLICT (document_id, version_number) DO NOTHING;

-- Task: assigned_to = member-user, assigned_by = co-user (both NOT NULL per core.tasks schema).
INSERT INTO core.tasks (
  task_id, title, description, agenda_item_id, meeting_id, assigned_to, assigned_by,
  priority, due_date, status, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000401'::uuid,
  'Draft India position on MARPOL Annex VI amendments',
  'Review IMO document MSC 108/4/1 and prepare India national position paper.',
  '00000000-0000-0000-0000-000000000101'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'c1000000-0000-0000-0000-000000000004'::uuid,
  'c1000000-0000-0000-0000-000000000001'::uuid,
  'HIGH',
  (CURRENT_DATE + 7)::timestamptz,
  'PENDING',
  NOW(), NOW()
) ON CONFLICT (task_id) DO NOTHING;

INSERT INTO core.task_assignees (task_id, user_id, assigned_at)
VALUES (
  '00000000-0000-0000-0000-000000000401'::uuid,
  'c1000000-0000-0000-0000-000000000004'::uuid,
  NOW()
) ON CONFLICT (task_id, user_id) DO NOTHING;

-- Demo paper (core.papers) for approval / submit workflow — separate from documents.documents
INSERT INTO core.papers (
  paper_id, meeting_id, agenda_item_id, title, status, draft_version, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000501'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000101'::uuid,
  'India — MARPOL Annex VI amendments (demo paper)',
  'DRAFT',
  0,
  NOW(), NOW()
) ON CONFLICT (paper_id) DO NOTHING;

-- Meeting participants for demo meeting (tasks / delegation views). Requires V22 coordinator role.
INSERT INTO core.meeting_participants (meeting_id, user_id, meeting_role, assigned_at)
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid,
  u.user_id,
  CASE u.system_role
    WHEN 'COORDINATOR' THEN 'COORDINATOR'::varchar
    WHEN 'DELEGATION_LEADER' THEN 'DELEGATION_LEADER'::varchar
    WHEN 'MEMBER' THEN 'MEMBER'::varchar
    WHEN 'IC_DIVISION_HEAD' THEN 'OBSERVER'::varchar
    WHEN 'SYSTEM_ADMIN' THEN 'OBSERVER'::varchar
    ELSE 'OBSERVER'::varchar
  END,
  NOW()
FROM core.users u
WHERE u.is_active = true
  AND u.system_role IN ('MEMBER', 'COORDINATOR', 'DELEGATION_LEADER', 'IC_DIVISION_HEAD', 'SYSTEM_ADMIN')
ON CONFLICT (meeting_id, user_id) DO NOTHING;

-- Patch version content for meaningful diff (plain text differences after HTML strip)
UPDATE documents.document_versions
SET content_html = '<p>India supports the proposed amendments to MARPOL Annex VI subject to the following considerations. The implementation timeline should allow developing nations adequate transition periods. Technical assistance mechanisms should be established for flag states with limited capacity. India proposes a phased implementation schedule.</p>'
WHERE document_id = '00000000-0000-0000-0000-000000000201'
  AND version_number = 1;

UPDATE documents.document_versions
SET content_html = '<p>India strongly supports the proposed amendments to MARPOL Annex VI subject to the following considerations. The implementation timeline should allow developing nations adequate transition periods. Technical assistance mechanisms should be established for flag states requiring additional support. India proposes a phased implementation schedule with clear interim milestones.</p>'
WHERE document_id = '00000000-0000-0000-0000-000000000201'
  AND version_number = 2;

UPDATE documents.documents
SET content_html = '<p>India strongly supports the proposed amendments to MARPOL Annex VI subject to the following considerations. The implementation timeline should allow developing nations adequate transition periods. Technical assistance mechanisms should be established for flag states requiring additional support. India proposes a phased implementation schedule with clear interim milestones.</p>',
    current_version = 2
WHERE document_id = '00000000-0000-0000-0000-000000000201';

SELECT 'Demo seed complete' AS status;
SELECT 'Meeting: MSC 108 — ID: 00000000-0000-0000-0000-000000000001' AS info
UNION ALL
SELECT 'Agenda item 4.1 — ID: 00000000-0000-0000-0000-000000000101'
UNION ALL
SELECT 'Document (2 versions) — ID: 00000000-0000-0000-0000-000000000201'
UNION ALL
SELECT 'Task — ID: 00000000-0000-0000-0000-000000000401';
