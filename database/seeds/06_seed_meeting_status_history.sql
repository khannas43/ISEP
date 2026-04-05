-- Sample status history for meeting detail Timeline/History tab. Run after V7 and 05.
-- Inserts two entries per meeting (PLANNED->ACTIVE, ACTIVE->CONCLUDED or PLANNED) where none exist.

DO $$
DECLARE
  mid uuid;
  uid uuid;
  start_ts timestamptz;
  end_ts timestamptz;
  mstatus text;
BEGIN
  SELECT user_id INTO uid FROM core.users LIMIT 1;
  IF uid IS NULL THEN RETURN; END IF;

  FOR mid IN SELECT meeting_id FROM core.meetings ORDER BY start_date ASC
  LOOP
    IF NOT EXISTS (SELECT 1 FROM core.meeting_status_history WHERE meeting_id = mid LIMIT 1) THEN
      SELECT m.start_date::timestamptz + time '10:00', m.end_date::timestamptz + time '18:00', m.status
      INTO start_ts, end_ts, mstatus FROM core.meetings m WHERE m.meeting_id = mid;

      INSERT INTO core.meeting_status_history (meeting_id, from_status, to_status, changed_by, changed_at, notes)
      VALUES (mid, 'PLANNED', 'ACTIVE', uid, start_ts - interval '1 day', 'Session opened.');

      IF mstatus IN ('CONCLUDED', 'ARCHIVED', 'CANCELLED') THEN
        INSERT INTO core.meeting_status_history (meeting_id, from_status, to_status, changed_by, changed_at, notes)
        VALUES (mid, 'ACTIVE', mstatus, uid, end_ts + interval '2 hours', 'Session closed.');
      END IF;
    END IF;
  END LOOP;
END $$;
