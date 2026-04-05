-- Meeting status history (audit trail for Timelines/History tab). Idempotent: IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS core.meeting_status_history (
    entry_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id     UUID NOT NULL REFERENCES core.meetings(meeting_id) ON DELETE CASCADE,
    from_status    VARCHAR(20) NOT NULL,
    to_status      VARCHAR(20) NOT NULL,
    changed_by     UUID REFERENCES core.users(user_id),
    changed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes          TEXT
);

CREATE INDEX IF NOT EXISTS idx_meeting_status_history_meeting_id ON core.meeting_status_history(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_status_history_changed_at ON core.meeting_status_history(changed_at);
