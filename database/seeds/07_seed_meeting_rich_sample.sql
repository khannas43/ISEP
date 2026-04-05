-- Rich sample data: locations (India), 2-3 para overview, 8 agenda items with deadlines, tasks, correspondence groups.
-- Run after 01–04 (bodies, meetings, reference, users). Safe to re-run. Ensures ALL meetings have participants, status history, tasks, CGs.

-- 0) Backfill participants (5 per meeting), status history (2 per meeting), and tasks (3 per meeting) for EVERY meeting
DO $$
DECLARE
  mid uuid;
  uid uuid;
  urow RECORD;
  roles text[] := ARRAY['DELEGATION_LEADER','MEMBER','OBSERVER','MEMBER','OBSERVER'];
  idx int := 1;
BEGIN
  FOR mid IN SELECT meeting_id FROM core.meetings
  LOOP
    idx := 1;
    FOR urow IN SELECT user_id FROM core.users ORDER BY user_id LIMIT 5
    LOOP
      INSERT INTO core.meeting_participants (meeting_id, user_id, meeting_role, assigned_at)
      VALUES (mid, urow.user_id, roles[idx], NOW())
      ON CONFLICT (meeting_id, user_id) DO NOTHING;
      idx := idx + 1;
    END LOOP;
  END LOOP;
END $$;

DO $$
DECLARE mid uuid; uid uuid; start_ts timestamptz; end_ts timestamptz; mstatus text;
BEGIN
  SELECT user_id INTO uid FROM core.users LIMIT 1;
  IF uid IS NULL THEN RETURN; END IF;
  FOR mid IN SELECT meeting_id FROM core.meetings ORDER BY start_date
  LOOP
    IF NOT EXISTS (SELECT 1 FROM core.meeting_status_history WHERE meeting_id = mid LIMIT 1) THEN
      SELECT m.start_date::timestamptz + time '10:00', m.end_date::timestamptz + time '18:00', m.status
      INTO start_ts, end_ts, mstatus FROM core.meetings m WHERE m.meeting_id = mid;
      INSERT INTO core.meeting_status_history (meeting_id, from_status, to_status, changed_by, changed_at, notes)
      VALUES (mid, 'PLANNED', 'ACTIVE', uid, start_ts - interval '1 day', 'Session opened.');
      IF mstatus IN ('CONCLUDED', 'ARCHIVED', 'CANCELLED') THEN
        INSERT INTO core.meeting_status_history (meeting_id, from_status, to_status, changed_by, changed_at, notes)
        VALUES (mid, 'ACTIVE', mstatus, uid, end_ts + interval '2 hours', 'Session closed.');
      ELSIF mstatus = 'ACTIVE' THEN
        INSERT INTO core.meeting_status_history (meeting_id, from_status, to_status, changed_by, changed_at, notes)
        VALUES (mid, 'PLANNED', 'ACTIVE', uid, start_ts - interval '1 day', 'Session opened.');
      END IF;
    END IF;
  END LOOP;
END $$;

-- 1) Meeting locations: set many to Indian cities (cycle: Mumbai, New Delhi, Chennai, Kolkata, Hyderabad, Goa)
UPDATE core.meetings SET location = 'Mumbai' WHERE meeting_id IN (
  'b1000000000000000000000000000002','b1000000000000000000000000000008','b100000000000000000000000000000e','b1000000000000000000000000000014','b100000000000000000000000000001a','b1000000000000000000000000000020','b1000000000000000000000000000026','b1000000000000000000000000000032');
UPDATE core.meetings SET location = 'New Delhi' WHERE meeting_id IN (
  'b1000000000000000000000000000004','b100000000000000000000000000000a','b1000000000000000000000000000010','b1000000000000000000000000000016','b100000000000000000000000000001c','b1000000000000000000000000000022','b1000000000000000000000000000028','b1000000000000000000000000000034');
UPDATE core.meetings SET location = 'Chennai' WHERE meeting_id IN (
  'b1000000000000000000000000000006','b100000000000000000000000000000c','b1000000000000000000000000000012','b1000000000000000000000000000018','b100000000000000000000000000001e','b1000000000000000000000000000024','b100000000000000000000000000002a','b1000000000000000000000000000036');
UPDATE core.meetings SET location = 'Kolkata' WHERE meeting_id IN (
  'b1000000000000000000000000000003','b1000000000000000000000000000009','b100000000000000000000000000000f','b1000000000000000000000000000015','b100000000000000000000000000001b','b1000000000000000000000000000021','b100000000000000000000000000002d','b1000000000000000000000000000039');
UPDATE core.meetings SET location = 'Hyderabad' WHERE meeting_id IN (
  'b1000000000000000000000000000005','b100000000000000000000000000000b','b1000000000000000000000000000011','b1000000000000000000000000000017','b100000000000000000000000000001d','b1000000000000000000000000000023','b100000000000000000000000000002f','b100000000000000000000000000003b');
UPDATE core.meetings SET location = 'Goa' WHERE meeting_id IN (
  'b1000000000000000000000000000007','b100000000000000000000000000000d','b1000000000000000000000000000013','b1000000000000000000000000000019','b100000000000000000000000000001f','b1000000000000000000000000000025','b1000000000000000000000000000031','b1000000000000000000000000000037','b100000000000000000000000000003c');

-- 2) Overview: 2–3 paragraph notes per meeting (template by “kind”: MSC/MEPC/HTW/NCSR/PPR/SDC/SSE/CCC/LEGAL/TCC/FAL/Assembly/Council/III)
DO $$
DECLARE
  r RECORD;
  loc text;
  para text;
BEGIN
  FOR r IN SELECT meeting_id, title, body_id, start_date FROM core.meetings ORDER BY start_date
  LOOP
    loc := (SELECT location FROM core.meetings WHERE meeting_id = r.meeting_id);
    para := CASE
      WHEN r.title LIKE 'MSC%' THEN 'This session of the Maritime Safety Committee addressed a broad range of safety-related items, including amendments to SOLAS and related codes, and the adoption of new guidelines. The Committee considered reports from sub-committees and correspondence groups, and agreed on a number of draft resolutions for submission to the Assembly. Delegations expressed support for the work undertaken and highlighted the importance of consistent implementation across member states. The Secretariat was requested to circulate the agreed documents and to include the relevant items in the work programme for the next session.'
      WHEN r.title LIKE 'MEPC%' THEN 'The Marine Environment Protection Committee considered environmental matters including the implementation of the GHG strategy, ballast water management, and marine plastic litter. Draft resolutions and guidelines were prepared for adoption, and the Committee noted the progress of correspondence groups. Several member states submitted documents and interventions; the Secretariat was asked to consolidate comments and prepare a revised text for the next meeting. The need for capacity building and technical cooperation was underlined.'
      WHEN r.title LIKE 'HTW%' THEN 'The Sub-Committee on Human Element, Training and Watchkeeping reviewed proposed amendments to the STCW Convention and Code, and considered model courses and other guidance. Correspondence group reports were received and discussed; the Sub-Committee agreed on next steps for the revision of certain provisions. Delegations stressed the importance of maintaining high standards of training and the need for clear implementation guidelines.'
      WHEN r.title LIKE 'NCSR%' OR r.title LIKE 'PPR%' THEN 'Navigation, communications, search and rescue, and pollution prevention items were on the agenda. The Sub-Committee considered e-navigation, GMDSS modernization, and related draft amendments. Working and correspondence group outcomes were noted; several documents were deferred for further consideration. The Secretariat was requested to prepare a consolidated document for the parent committee.'
      WHEN r.title LIKE 'SDC%' OR r.title LIKE 'SSE%' THEN 'Ship design and construction and ship systems and equipment were discussed. Goal-based standards, life-saving appliances, and fire protection were among the topics. The Sub-Committee agreed on draft amendments and on the extension of mandates for correspondence groups where necessary. Progress on the revision of circulars was noted.'
      WHEN r.title LIKE 'CCC%' THEN 'The Sub-Committee on Carriage of Cargoes and Containers considered amendments to the IMSBC Code and matters related to the IGF Code. Proposals from member states and industry were discussed; the Sub-Committee agreed on a number of amendments and on the need for further work on certain items. The Secretariat was asked to issue the agreed amendments in due course.'
      WHEN r.title LIKE 'LEGAL%' THEN 'The Legal Committee considered liability and compensation matters, treaty status, and legal aspects of maritime legislation. The Secretariat reported on recent ratifications and on the status of conventions. The Committee adopted a number of decisions and requested the Secretariat to prepare documentation for the next session.'
      WHEN r.title LIKE 'TCC%' THEN 'Technical cooperation and capacity-building were discussed. The Committee reviewed TC programmes and the integration of new conventions into technical assistance projects. Donor coordination and regional initiatives were also on the agenda. The Secretariat was requested to continue its work in line with the agreed strategy.'
      WHEN r.title LIKE 'FAL%' THEN 'The Facilitation Committee considered formalities and the single window concept, and discussed convention amendments and best practices. Draft recommendations were agreed. The Committee noted the importance of digitalization and of harmonized procedures across member states.'
      WHEN r.title LIKE 'Assembly%' THEN 'The Assembly session addressed strategic planning, budget, and high-level policy. Reports from the Council and committees were received. Resolutions were adopted on a range of matters. The Assembly emphasized the need for effective implementation of instruments and for continued cooperation among member states.'
      WHEN r.title LIKE 'Council%' THEN 'The Council considered mid-term strategy, programme and budget, and oversight of committee work. Decisions and resolutions were adopted. The Council reviewed the work programme and requested the Secretariat to prepare documentation for the next session.'
      WHEN r.title LIKE 'III%' THEN 'Implementation of IMO instruments, the audit scheme, and port State control matters were discussed. Guidelines and procedures were reviewed. The Sub-Committee agreed on next steps and requested the Secretariat to prepare relevant documentation.'
      ELSE 'The session addressed items on the work programme and considered reports from working and correspondence groups. The agenda was adopted and the chair reported on intersessional work. A number of submissions were considered and outcomes were agreed for submission to the parent committee as appropriate.'
    END;
    para := para || E'\n\n' || 'The meeting was held in ' || COALESCE(loc, 'London') || '. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.'
    || E'\n\n' || 'Summary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.';
    UPDATE core.meetings SET notes = para WHERE meeting_id = r.meeting_id;
  END LOOP;
END $$;

-- 3) Agenda: ensure 8 items per meeting with deadline_for_inputs (add items 4–8 where count < 8)
DO $$
DECLARE
  mid uuid;
  cnt int;
  i int;
  start_ts timestamptz;
  titles text[] := ARRAY[
    'Adoption of the agenda', 'Report of the Chair', 'Strategic plan and work programme',
    'Reports of working groups', 'Draft amendments and guidelines', 'Any other business',
    'Consideration of submissions', 'Date and place of next session'
  ];
  descrs text[] := ARRAY[
    'Agenda as circulated.', 'Report on intersessional work.', 'Review of strategic plan and work programme.',
    'Reports from working groups.', 'Draft amendments and guidelines for consideration.', 'Items raised under AOB.',
    'Consideration of member state submissions.', 'To be determined.'
  ];
  cats text[] := ARRAY['DISCUSSION','INFORMATION','INFORMATION','INFORMATION','DECISION','ANY_OTHER_BUSINESS','DISCUSSION','INFORMATION'];
  prios text[] := ARRAY['HIGH','MEDIUM','MEDIUM','MEDIUM','HIGH','LOW','MEDIUM','LOW'];
BEGIN
  FOR mid IN SELECT meeting_id FROM core.meetings ORDER BY start_date
  LOOP
    SELECT COUNT(*) INTO cnt FROM core.agenda_items WHERE meeting_id = mid;
    SELECT (start_date - interval '14 days')::timestamptz + time '17:00' INTO start_ts FROM core.meetings WHERE meeting_id = mid;
    IF cnt < 8 THEN
      FOR i IN (cnt + 1)..8 LOOP
        INSERT INTO core.agenda_items (meeting_id, item_number, title, description, category, priority, status, deadline_for_inputs)
        VALUES (mid, i::text, titles[i], descrs[i], cats[i], prios[i], 'ACTIVE', start_ts + (i * interval '2 days'));
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- Set deadline_for_inputs for any agenda items still null (e.g. existing 3-item rows)
UPDATE core.agenda_items a SET deadline_for_inputs = (SELECT (m.start_date - interval '7 days')::timestamptz + time '17:00' FROM core.meetings m WHERE m.meeting_id = a.meeting_id)
WHERE deadline_for_inputs IS NULL;

-- Assign coordinator to agenda items (column added in V8)
UPDATE core.agenda_items SET assigned_coordinator_id = (SELECT user_id FROM core.users LIMIT 1)
WHERE assigned_coordinator_id IS NULL;

-- 4) Tasks: 3 tasks per meeting (ensure every meeting has at least 3 tasks)
DO $$
DECLARE
  mid uuid;
  uid uuid;
  start_ts timestamptz;
BEGIN
  SELECT user_id INTO uid FROM core.users LIMIT 1;
  IF uid IS NULL THEN RETURN; END IF;
  FOR mid IN SELECT meeting_id FROM core.meetings
  LOOP
    IF (SELECT COUNT(*) FROM core.tasks WHERE meeting_id = mid) < 3 THEN
      SELECT (start_date::timestamptz - interval '3 days') INTO start_ts FROM core.meetings WHERE meeting_id = mid;
      INSERT INTO core.tasks (title, description, meeting_id, assigned_to, assigned_by, priority, due_date, status)
      VALUES ('Prepare briefing notes', 'Briefing notes for delegation on key agenda items.', mid, uid, uid, 'HIGH', start_ts + interval '1 day', 'ASSIGNED');
      INSERT INTO core.tasks (title, description, meeting_id, assigned_to, assigned_by, priority, due_date, status)
      VALUES ('Circulate position paper', 'Draft and circulate position paper to stakeholders.', mid, uid, uid, 'MEDIUM', start_ts + interval '2 days', 'ASSIGNED');
      INSERT INTO core.tasks (title, description, meeting_id, assigned_to, assigned_by, priority, due_date, status)
      VALUES ('Follow-up with Secretariat', 'Follow up with Secretariat on document deadlines.', mid, uid, uid, 'LOW', start_ts + interval '3 days', 'ASSIGNED');
    END IF;
  END LOOP;
END $$;

-- 5) Correspondence groups: 2 per body (parent_body_id); one member per CG
INSERT INTO correspondence.correspondence_groups (cg_id, parent_body_id, name, mandate, india_lead_id, start_date, end_date, status)
SELECT gen_random_uuid(), b.body_id, b.name || ' CG ' || g.n, 'To consider and report on matters referred by the parent body.', (SELECT user_id FROM core.users LIMIT 1), '2024-01-01'::date, '2025-12-31'::date, 'ACTIVE'
FROM core.international_bodies b
CROSS JOIN (VALUES (1), (2)) AS g(n)
WHERE NOT EXISTS (SELECT 1 FROM correspondence.correspondence_groups cg WHERE cg.parent_body_id = b.body_id);

INSERT INTO correspondence.cg_members (cg_id, user_id, role)
SELECT cg.cg_id, cg.india_lead_id, 'Lead'
FROM correspondence.correspondence_groups cg
WHERE cg.india_lead_id IS NOT NULL
ON CONFLICT (cg_id, user_id) DO NOTHING;

INSERT INTO correspondence.cg_members (cg_id, user_id, role)
SELECT cg.cg_id, u.user_id, 'Member'
FROM correspondence.correspondence_groups cg, (SELECT user_id FROM core.users ORDER BY user_id OFFSET 1 LIMIT 1) u
ON CONFLICT (cg_id, user_id) DO NOTHING;
