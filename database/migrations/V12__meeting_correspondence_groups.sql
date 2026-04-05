-- Junction table: users can pick which correspondence groups are linked to a meeting.
-- Only CGs whose parent body matches the meeting's body can be assigned.

CREATE TABLE IF NOT EXISTS core.meeting_correspondence_groups (
    meeting_id UUID NOT NULL REFERENCES core.meetings(meeting_id) ON DELETE CASCADE,
    cg_id      UUID NOT NULL REFERENCES correspondence.correspondence_groups(cg_id) ON DELETE CASCADE,
    PRIMARY KEY (meeting_id, cg_id)
);

CREATE INDEX IF NOT EXISTS idx_meeting_correspondence_groups_meeting_id ON core.meeting_correspondence_groups(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_correspondence_groups_cg_id ON core.meeting_correspondence_groups(cg_id);

COMMENT ON TABLE core.meeting_correspondence_groups IS 'User-selected correspondence groups for a meeting (body must match).';
