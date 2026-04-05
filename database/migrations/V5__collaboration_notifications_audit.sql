-- Collaboration (feedback), notifications, audit (SRS-06 entities 2.10, 2.13, 2.14)

CREATE TABLE collaboration.feedback (
    feedback_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agenda_item_id       UUID NOT NULL REFERENCES core.agenda_items(agenda_item_id),
    document_id          UUID REFERENCES documents.documents(document_id),
    user_id              UUID NOT NULL REFERENCES core.users(user_id),
    position             VARCHAR(20)
                         CHECK (position IN ('SUPPORT', 'OBJECT', 'NEUTRAL', 'ABSTAIN')),
    comments             TEXT,
    suggested_amendments TEXT,
    status               VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                         CHECK (status IN ('DRAFT', 'SUBMITTED', 'REVIEWED')),
    submitted_at         TIMESTAMPTZ,
    reviewed_by          UUID REFERENCES core.users(user_id),
    reviewed_at          TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_agenda_item_id ON collaboration.feedback(agenda_item_id);
CREATE INDEX idx_feedback_user_id ON collaboration.feedback(user_id);

CREATE TABLE correspondence.correspondence_groups (
    cg_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_body_id  UUID NOT NULL REFERENCES core.international_bodies(body_id),
    name            VARCHAR(500) NOT NULL,
    mandate         TEXT,
    india_lead_id   UUID REFERENCES core.users(user_id),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                   CHECK (status IN ('ACTIVE', 'CONCLUDED')),
    imso_reference  VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE correspondence.cg_members (
    cg_member_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cg_id          UUID NOT NULL REFERENCES correspondence.correspondence_groups(cg_id),
    user_id        UUID NOT NULL REFERENCES core.users(user_id),
    role           VARCHAR(50),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(cg_id, user_id)
);

CREATE TABLE notifications.notifications (
    notification_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id     UUID NOT NULL REFERENCES core.users(user_id),
    notification_type    VARCHAR(100) NOT NULL,
    title                 VARCHAR(500),
    message               TEXT,
    linked_entity_type    VARCHAR(100),
    linked_entity_id      VARCHAR(255),
    is_read               BOOLEAN NOT NULL DEFAULT FALSE,
    delivered_in_portal_at TIMESTAMPTZ,
    delivered_email_at    TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications.notifications(recipient_user_id);
CREATE INDEX idx_notifications_is_read ON notifications.notifications(is_read);

-- Audit logs: immutable (SRS-06 §4.5). No FK to application tables to preserve immutability.
CREATE TABLE audit.audit_logs (
    audit_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id         UUID,
    user_email      VARCHAR(255),
    session_id      VARCHAR(255),
    ip_address      INET,
    action_type     VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       VARCHAR(255),
    description     TEXT NOT NULL,
    before_state    JSONB,
    after_state     JSONB,
    trace_id        VARCHAR(100)
);

CREATE INDEX idx_audit_logs_timestamp ON audit.audit_logs(timestamp);
CREATE INDEX idx_audit_logs_entity ON audit.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user_id ON audit.audit_logs(user_id);

ALTER TABLE audit.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_insert_only ON audit.audit_logs
    FOR INSERT WITH CHECK (true);
-- SELECT allowed for application; admin-only access enforced at API layer
CREATE POLICY audit_select ON audit.audit_logs
    FOR SELECT USING (true);
