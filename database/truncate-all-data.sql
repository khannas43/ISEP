-- Truncate all application tables in known schemas (only tables that exist).
-- Run with session_replication_role = replica to avoid FK issues.
-- Use before loading a data-only dump when the DB already has data.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN (
      'core', 'audit', 'documents', 'workflow',
      'collaboration', 'correspondence', 'notifications'
    )
    ORDER BY schemaname, tablename
  LOOP
    EXECUTE format('TRUNCATE TABLE %I.%I CASCADE', r.schemaname, r.tablename);
  END LOOP;
END $$;
