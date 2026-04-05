-- Optional coordinator per agenda item (for sample data and UI)

ALTER TABLE core.agenda_items
ADD COLUMN IF NOT EXISTS assigned_coordinator_id UUID REFERENCES core.users(user_id);

CREATE INDEX IF NOT EXISTS idx_agenda_items_assigned_coordinator ON core.agenda_items(assigned_coordinator_id);
