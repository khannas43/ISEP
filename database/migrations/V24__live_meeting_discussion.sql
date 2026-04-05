-- V24 — Live meeting discussion boards (Phase 5 / Batch 14)

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
    ADD COLUMN IF NOT EXISTS discussion_locked    BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS discussion_locked_by UUID REFERENCES core.users(user_id),
    ADD COLUMN IF NOT EXISTS discussion_locked_at TIMESTAMPTZ;

ALTER TABLE core.meetings
    ADD COLUMN IF NOT EXISTS live_session_active BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS live_session_started_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_live_posts_meeting
    ON collaboration.live_posts(meeting_id, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_posts_agenda
    ON collaboration.live_posts(agenda_item_id, posted_at ASC);

-- Demo posts (idempotent): first agenda item of demo meeting, if rows exist
INSERT INTO collaboration.live_posts
    (meeting_id, agenda_item_id, posted_by, content, post_type, posted_at)
SELECT
    m.meeting_id,
    ai.agenda_item_id,
    u.user_id,
    'India supports the proposed amendments and wishes to highlight the importance of an adequate transition period for developing nations.',
    'INTERVENTION',
    NOW() - INTERVAL '45 minutes'
FROM core.meetings m
JOIN core.agenda_items ai ON ai.meeting_id = m.meeting_id
JOIN LATERAL (SELECT user_id FROM core.users WHERE system_role = 'DELEGATION_LEADER' AND is_active = TRUE LIMIT 1) u ON TRUE
WHERE m.meeting_id = '00000000-0000-0000-0000-000000000001'
  AND NOT EXISTS (
    SELECT 1 FROM collaboration.live_posts lp
    WHERE lp.meeting_id = m.meeting_id
      AND lp.post_type = 'INTERVENTION'
      AND lp.content LIKE 'India supports the proposed amendments%'
  )
ORDER BY ai.item_number NULLS LAST, ai.agenda_item_id
LIMIT 1;

INSERT INTO collaboration.live_posts
    (meeting_id, agenda_item_id, posted_by, content, post_type, posted_at)
SELECT
    m.meeting_id,
    ai.agenda_item_id,
    u.user_id,
    'Request clarification on the technical assistance provisions under the proposed amendments.',
    'COMMENT',
    NOW() - INTERVAL '30 minutes'
FROM core.meetings m
JOIN core.agenda_items ai ON ai.meeting_id = m.meeting_id
JOIN LATERAL (SELECT user_id FROM core.users WHERE system_role = 'COORDINATOR' AND is_active = TRUE LIMIT 1) u ON TRUE
WHERE m.meeting_id = '00000000-0000-0000-0000-000000000001'
  AND NOT EXISTS (
    SELECT 1 FROM collaboration.live_posts lp
    WHERE lp.meeting_id = m.meeting_id
      AND lp.post_type = 'COMMENT'
      AND lp.content LIKE 'Request clarification on the technical assistance%'
  )
ORDER BY ai.item_number NULLS LAST, ai.agenda_item_id
LIMIT 1;

INSERT INTO collaboration.live_posts
    (meeting_id, agenda_item_id, posted_by, content, post_type, posted_at)
SELECT
    m.meeting_id,
    ai.agenda_item_id,
    u.user_id,
    'Noted. India''s position paper has been circulated to all delegations.',
    'INFORMATION',
    NOW() - INTERVAL '15 minutes'
FROM core.meetings m
JOIN core.agenda_items ai ON ai.meeting_id = m.meeting_id
JOIN LATERAL (SELECT user_id FROM core.users WHERE system_role = 'SYSTEM_ADMIN' AND is_active = TRUE LIMIT 1) u ON TRUE
WHERE m.meeting_id = '00000000-0000-0000-0000-000000000001'
  AND NOT EXISTS (
    SELECT 1 FROM collaboration.live_posts lp
    WHERE lp.meeting_id = m.meeting_id
      AND lp.post_type = 'INFORMATION'
      AND lp.content LIKE 'Noted. India%'
  )
ORDER BY ai.item_number NULLS LAST, ai.agenda_item_id
LIMIT 1;
