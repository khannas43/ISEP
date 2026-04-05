-- Core schema: users, international_bodies, meetings, agenda_items, meeting_participants (SRS-06 §4.1–4.3)

CREATE TABLE core.users (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_id     VARCHAR(255) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    designation     VARCHAR(255),
    organization    VARCHAR(255),
    phone           VARCHAR(20),
    system_role     VARCHAR(50) NOT NULL
                    CHECK (system_role IN (
                        'SYSTEM_ADMIN', 'IC_DIVISION_HEAD',
                        'DELEGATION_LEADER', 'COORDINATOR',
                        'MEMBER', 'VIEWER'
                    )),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    mfa_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES core.users(user_id),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON core.users(email);
CREATE INDEX idx_users_keycloak_id ON core.users(keycloak_id);
CREATE INDEX idx_users_system_role ON core.users(system_role);

CREATE TABLE core.international_bodies (
    body_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_body_id  UUID REFERENCES core.international_bodies(body_id),
    name            VARCHAR(500) NOT NULL,
    abbreviation    VARCHAR(50),
    body_type       VARCHAR(50) NOT NULL
                    CHECK (body_type IN (
                        'ASSEMBLY', 'COUNCIL', 'COMMITTEE',
                        'SUB_COMMITTEE', 'WORKING_GROUP',
                        'CORRESPONDENCE_GROUP', 'BILATERAL', 'OTHER'
                    )),
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE core.meetings (
    meeting_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    body_id         UUID NOT NULL REFERENCES core.international_bodies(body_id),
    session_number  VARCHAR(50),
    title           VARCHAR(500) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    location        VARCHAR(500),
    meeting_type    VARCHAR(20) NOT NULL
                    CHECK (meeting_type IN ('IN_PERSON', 'VIRTUAL', 'HYBRID')),
    status          VARCHAR(20) NOT NULL DEFAULT 'PLANNED'
                    CHECK (status IN ('PLANNED', 'ACTIVE', 'CONCLUDED', 'ARCHIVED', 'CANCELLED')),
    cancellation_reason TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES core.users(user_id),
    CONSTRAINT meetings_dates_check CHECK (end_date >= start_date)
);

CREATE INDEX idx_meetings_body_id ON core.meetings(body_id);
CREATE INDEX idx_meetings_status ON core.meetings(status);
CREATE INDEX idx_meetings_start_date ON core.meetings(start_date);

CREATE TABLE core.agenda_items (
    agenda_item_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id       UUID NOT NULL REFERENCES core.meetings(meeting_id),
    item_number      VARCHAR(50),
    title            VARCHAR(1000) NOT NULL,
    description       TEXT,
    category         VARCHAR(50)
                     CHECK (category IN ('DISCUSSION', 'DECISION', 'INFORMATION', 'ANY_OTHER_BUSINESS')),
    priority         VARCHAR(20),
    status           VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                     CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED')),
    deadline_for_inputs TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agenda_items_meeting_id ON core.agenda_items(meeting_id);

CREATE TABLE core.meeting_participants (
    participant_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id      UUID NOT NULL REFERENCES core.meetings(meeting_id),
    user_id         UUID NOT NULL REFERENCES core.users(user_id),
    meeting_role    VARCHAR(50) NOT NULL
                    CHECK (meeting_role IN ('DELEGATION_LEADER', 'MEMBER', 'OBSERVER')),
    assigned_by     UUID REFERENCES core.users(user_id),
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
);

CREATE INDEX idx_meeting_participants_meeting_id ON core.meeting_participants(meeting_id);
CREATE INDEX idx_meeting_participants_user_id ON core.meeting_participants(user_id);
