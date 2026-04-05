-- System configuration (SCR-SYS-03) and announcements (SCR-CAL-04).
-- Config: key-value store; changes audited. Announcements: subject, body, scope, broadcast state.

CREATE TABLE IF NOT EXISTS core.system_config (
    config_key   VARCHAR(100) PRIMARY KEY,
    config_value TEXT         NOT NULL DEFAULT '{}',
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_by   UUID         REFERENCES core.users(user_id)
);

COMMENT ON TABLE core.system_config IS 'Platform-wide settings; all changes logged to audit.';

CREATE TABLE IF NOT EXISTS core.announcements (
    announcement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject         VARCHAR(500) NOT NULL,
    body            TEXT         NOT NULL,
    urgency         VARCHAR(20)  NOT NULL DEFAULT 'INFORMATIONAL'
        CHECK (urgency IN ('INFORMATIONAL', 'IMPORTANT', 'URGENT')),
    scope           VARCHAR(50)  NOT NULL DEFAULT 'ALL_USERS'
        CHECK (scope IN ('ALL_USERS', 'BY_ROLE', 'BY_COMMITTEE')),
    scope_value     VARCHAR(500),  -- e.g. role name or body id list
    status          VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'PUBLISHED')),
    published_at    TIMESTAMPTZ,
    created_by      UUID         REFERENCES core.users(user_id),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_status ON core.announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON core.announcements(published_at);

COMMENT ON TABLE core.announcements IS 'System announcements; published items shown as pinned banner and optionally emailed.';
