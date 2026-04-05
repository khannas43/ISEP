-- Store IP address as VARCHAR so JPA String mapping works (INET required custom type).
-- Existing NULLs and any future IP strings (e.g. '192.168.1.1') are stored as text.
ALTER TABLE audit.audit_logs
  ALTER COLUMN ip_address TYPE VARCHAR(45) USING (ip_address::text);
