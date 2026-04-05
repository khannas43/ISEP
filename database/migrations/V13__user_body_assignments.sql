-- User committee (body) assignments for SCR-USR-05. Links users to international bodies they are assigned to.
CREATE TABLE IF NOT EXISTS core.user_body_assignments (
    user_id UUID NOT NULL REFERENCES core.users(user_id) ON DELETE CASCADE,
    body_id UUID NOT NULL REFERENCES core.international_bodies(body_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, body_id)
);

CREATE INDEX IF NOT EXISTS idx_user_body_assignments_user_id ON core.user_body_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_body_assignments_body_id ON core.user_body_assignments(body_id);

COMMENT ON TABLE core.user_body_assignments IS 'User assignments to committees (international bodies) for admin UI.';
