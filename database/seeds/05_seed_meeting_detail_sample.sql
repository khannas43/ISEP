-- Sample participants and agenda items for all meetings (detail page data). Run after 02_meetings_sample.sql and 04_seed_users.sql.
-- Idempotent for participants: ON CONFLICT DO NOTHING. Agenda items: run once (no conflict target). Uses core.meetings for all 70 meetings.

-- Participants: 2 users per meeting (DELEGATION_LEADER + MEMBER) for every meeting
INSERT INTO core.meeting_participants (meeting_id, user_id, meeting_role)
SELECT m.meeting_id, u.user_id, u.role
FROM core.meetings m
CROSS JOIN (VALUES
  ('c1000000-0000-0000-0000-000000000001'::uuid, 'DELEGATION_LEADER'::varchar),
  ('c1000000-0000-0000-0000-000000000002'::uuid, 'MEMBER'::varchar)
) AS u(user_id, role)
ON CONFLICT (meeting_id, user_id) DO NOTHING;

-- Third participant (OBSERVER) per meeting
INSERT INTO core.meeting_participants (meeting_id, user_id, meeting_role)
SELECT m.meeting_id, 'c1000000-0000-0000-0000-000000000003'::uuid, 'OBSERVER'
FROM core.meetings m
ON CONFLICT (meeting_id, user_id) DO NOTHING;

-- Fourth and fifth participants per meeting
INSERT INTO core.meeting_participants (meeting_id, user_id, meeting_role)
SELECT m.meeting_id, u.user_id, u.role
FROM core.meetings m
CROSS JOIN (VALUES
  ('c1000000-0000-0000-0000-000000000004'::uuid, 'MEMBER'),
  ('c1000000-0000-0000-0000-000000000005'::uuid, 'OBSERVER')
) AS u(user_id, role)
ON CONFLICT (meeting_id, user_id) DO NOTHING;

-- Agenda items: 3 items per meeting (only for meetings that have no agenda items yet)
INSERT INTO core.agenda_items (meeting_id, item_number, title, description, category, priority, status)
SELECT m.meeting_id, v.num, v.title, v.descr, v.cat, v.pri, 'ACTIVE'
FROM core.meetings m
CROSS JOIN (VALUES
  ('1', 'Adoption of the agenda', 'Agenda as circulated.', 'DISCUSSION', 'HIGH'),
  ('2', 'Report of the Chair', 'Report on intersessional work.', 'INFORMATION', 'MEDIUM'),
  ('3', 'Any other business', 'Items raised under AOB.', 'ANY_OTHER_BUSINESS', 'LOW')
) AS v(num, title, descr, cat, pri)
WHERE NOT EXISTS (SELECT 1 FROM core.agenda_items a WHERE a.meeting_id = m.meeting_id LIMIT 1);

-- Overview notes for all meetings that have no notes yet (meeting detail Overview tab)
UPDATE core.meetings SET notes = 'Session covered committee work programme, working group reports, and draft outcomes. Agenda adopted; chair''s report noted; several submissions considered under relevant agenda items.'
WHERE notes IS NULL OR notes = '';
