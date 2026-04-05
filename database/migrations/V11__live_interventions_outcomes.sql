-- Live meeting: interventions (SCR-LIVE-03) and meeting outcomes (SCR-LIVE-04)

-- Interventions: formal statements delivered at IMO meetings
CREATE TABLE IF NOT EXISTS core.meeting_interventions (
    intervention_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id        UUID NOT NULL REFERENCES core.meetings(meeting_id) ON DELETE CASCADE,
    agenda_item_id    UUID NOT NULL REFERENCES core.agenda_items(agenda_item_id) ON DELETE CASCADE,
    intervention_text TEXT NOT NULL,
    delivered_by_user_id UUID REFERENCES core.users(user_id),
    delivered_by_name VARCHAR(255),
    delivered_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    intervention_type VARCHAR(50) NOT NULL
        CHECK (intervention_type IN ('SUPPORT', 'OPPOSE', 'PROPOSE_AMENDMENT', 'INFORMATION')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meeting_interventions_meeting ON core.meeting_interventions(meeting_id);
CREATE INDEX idx_meeting_interventions_agenda ON core.meeting_interventions(agenda_item_id);

-- Meeting outcomes: decisions, resolutions, next steps per agenda item (post-meeting)
CREATE TABLE IF NOT EXISTS core.meeting_outcomes (
    outcome_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id    UUID NOT NULL REFERENCES core.meetings(meeting_id) ON DELETE CASCADE,
    agenda_item_id UUID NOT NULL REFERENCES core.agenda_items(agenda_item_id) ON DELETE CASCADE,
    decision      TEXT NOT NULL,
    resolution_ref VARCHAR(255),
    next_steps    TEXT,
    captured_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    captured_by_user_id UUID REFERENCES core.users(user_id)
);

CREATE INDEX idx_meeting_outcomes_meeting ON core.meeting_outcomes(meeting_id);
CREATE INDEX idx_meeting_outcomes_agenda ON core.meeting_outcomes(agenda_item_id);
