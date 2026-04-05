-- Sample tasks, papers, notifications, and audit log entries. Run after 05_seed_meeting_detail_sample.sql (agenda items exist).
-- Idempotent: each block inserts only when the target table is empty.

-- Tasks: one per recent meeting (assigned to coordinator)
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM core.tasks) = 0 THEN
    INSERT INTO core.tasks (task_id, title, description, meeting_id, assigned_to, assigned_by, priority, status, due_date)
    SELECT gen_random_uuid(), 'Prepare briefing for ' || m.title, 'Draft briefing note for delegation', m.meeting_id, 'c1000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 'HIGH', 'CREATED', (m.start_date + interval '14 days')::timestamptz
    FROM core.meetings m
    ORDER BY m.start_date DESC
    LIMIT 25;
  END IF;
END $$;

-- Papers: one per meeting for recent meetings (core.papers)
DO $$
DECLARE
  rec RECORD;
  aid uuid;
BEGIN
  IF (SELECT COUNT(*) FROM core.papers) = 0 THEN
    FOR rec IN SELECT meeting_id, title FROM core.meetings WHERE start_date >= '2025-01-01' ORDER BY start_date DESC LIMIT 15
    LOOP
      SELECT agenda_item_id INTO aid FROM core.agenda_items WHERE meeting_id = rec.meeting_id LIMIT 1;
      INSERT INTO core.papers (paper_id, meeting_id, agenda_item_id, title, status, draft_content, draft_version)
      VALUES (gen_random_uuid(), rec.meeting_id, aid, 'Draft position paper – ' || rec.title, 'DRAFT', 'Draft content for ' || rec.title || '. To be finalized.', 0);
    END LOOP;
  END IF;
END $$;

-- Notifications: a few per user
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM notifications.notifications) = 0 THEN
    INSERT INTO notifications.notifications (notification_id, recipient_user_id, notification_type, title, message, is_read, created_at)
    SELECT gen_random_uuid(), u.user_id, 'MEETING_REMINDER', 'Meeting reminder: MSC 113', 'MSC 113 starts next week. Please complete your briefing.', false, NOW() - interval '2 days'
    FROM core.users u LIMIT 3;
    INSERT INTO notifications.notifications (notification_id, recipient_user_id, notification_type, title, message, is_read, created_at)
    SELECT gen_random_uuid(), u.user_id, 'TASK_ASSIGNED', 'New task assigned', 'You have been assigned a new task for the upcoming meeting.', false, NOW() - interval '1 day'
    FROM core.users u LIMIT 2;
    INSERT INTO notifications.notifications (notification_id, recipient_user_id, notification_type, title, message, is_read, created_at)
    SELECT gen_random_uuid(), u.user_id, 'FEEDBACK_REQUESTED', 'Feedback requested', 'Your feedback on agenda item 2 is requested by Friday.', true, NOW() - interval '3 days'
    FROM core.users u LIMIT 2;
  END IF;
END $$;

-- Audit log: not seeded. Only real activity (e.g. system config updates) is written by the application.
-- If you previously ran this seed and want to remove old sample audit rows: TRUNCATE audit.audit_logs;
