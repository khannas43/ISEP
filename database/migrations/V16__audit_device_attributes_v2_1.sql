-- v2.1 — Device attributes added to audit trail per RFP Section 3.16H
-- ip_address may already exist (V5 + V15); IF NOT EXISTS keeps re-runs safe.

ALTER TABLE audit.audit_logs
  ADD COLUMN IF NOT EXISTS ip_address   VARCHAR(45),
  ADD COLUMN IF NOT EXISTS device_type  VARCHAR(50)
    CHECK (device_type IS NULL OR device_type IN ('DESKTOP', 'TABLET', 'MOBILE', 'UNKNOWN')),
  ADD COLUMN IF NOT EXISTS user_agent   TEXT;

COMMENT ON COLUMN audit.audit_logs.ip_address  IS 'Client IP — IPv4 or IPv6. Required per RFP 3.16H.';
COMMENT ON COLUMN audit.audit_logs.device_type IS 'DESKTOP|TABLET|MOBILE|UNKNOWN. Derived from user agent.';
COMMENT ON COLUMN audit.audit_logs.user_agent  IS 'Full browser/device user agent string.';
