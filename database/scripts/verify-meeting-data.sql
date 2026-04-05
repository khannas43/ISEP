-- Verify meeting detail data exists. Run with same host/port as seeds (e.g. localhost 5433).
-- Usage: PGPASSWORD=isep_dev_password psql -h localhost -p 5433 -U isep_app -d isep -f scripts/verify-meeting-data.sql

\echo '=== Counts ==='
SELECT 'core.meetings' AS tbl, COUNT(*) AS cnt FROM core.meetings
UNION ALL SELECT 'core.users', COUNT(*) FROM core.users
UNION ALL SELECT 'core.meeting_participants', COUNT(*) FROM core.meeting_participants
UNION ALL SELECT 'core.meeting_status_history', COUNT(*) FROM core.meeting_status_history
UNION ALL SELECT 'core.tasks', COUNT(*) FROM core.tasks
UNION ALL SELECT 'core.agenda_items', COUNT(*) FROM core.agenda_items
UNION ALL SELECT 'correspondence.correspondence_groups', COUNT(*) FROM correspondence.correspondence_groups;

\echo ''
\echo '=== Sample meeting (CCC 11, meeting_id b100...25) ==='
SELECT meeting_id, title, body_id FROM core.meetings WHERE title LIKE '%CCC 11%' LIMIT 1;

\echo ''
\echo 'Participants for CCC 11:'
SELECT mp.meeting_id, mp.user_id, mp.meeting_role
FROM core.meeting_participants mp
JOIN core.meetings m ON m.meeting_id = mp.meeting_id
WHERE m.title LIKE '%CCC 11%';

\echo ''
\echo 'Status history for CCC 11:'
SELECT meeting_id, from_status, to_status, changed_at
FROM core.meeting_status_history
WHERE meeting_id = (SELECT meeting_id FROM core.meetings WHERE title LIKE '%CCC 11%' LIMIT 1);

\echo ''
\echo 'Tasks for CCC 11:'
SELECT task_id, title, meeting_id FROM core.tasks
WHERE meeting_id = (SELECT meeting_id FROM core.meetings WHERE title LIKE '%CCC 11%' LIMIT 1);

\echo ''
\echo 'Correspondence groups for CCC 11 body:'
SELECT cg.cg_id, cg.name, cg.parent_body_id
FROM correspondence.correspondence_groups cg
WHERE cg.parent_body_id = (SELECT body_id FROM core.meetings WHERE title LIKE '%CCC 11%' LIMIT 1);
