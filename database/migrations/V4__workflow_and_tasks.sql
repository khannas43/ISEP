-- Workflow schema and core tasks (SRS-06 entities 2.8, 2.9, 2.11)

CREATE TABLE workflow.workflow_instances (
    workflow_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     UUID REFERENCES documents.documents(document_id),
    workflow_type   VARCHAR(50) NOT NULL
                    CHECK (workflow_type IN ('PAPER_APPROVAL', 'FEEDBACK_CONSOLIDATION', 'TASK_COMPLETION')),
    current_state   VARCHAR(100) NOT NULL,
    previous_state VARCHAR(100),
    initiated_by    UUID REFERENCES core.users(user_id),
    initiated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    deadline        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workflow.workflow_transition_logs (
    transition_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id      UUID NOT NULL REFERENCES workflow.workflow_instances(workflow_id),
    from_state      VARCHAR(100) NOT NULL,
    to_state        VARCHAR(100) NOT NULL,
    triggered_by    UUID REFERENCES core.users(user_id),
    trigger_action  VARCHAR(50) NOT NULL
                    CHECK (trigger_action IN ('APPROVE', 'REJECT', 'ESCALATE', 'SYSTEM')),
    comments        TEXT,
    transitioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_transition_logs_workflow_id ON workflow.workflow_transition_logs(workflow_id);

-- Tasks (SRS-06 entity 2.11) in core for meeting/agenda linkage
CREATE TABLE core.tasks (
    task_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title            VARCHAR(500) NOT NULL,
    description      TEXT,
    agenda_item_id   UUID REFERENCES core.agenda_items(agenda_item_id),
    meeting_id       UUID REFERENCES core.meetings(meeting_id),
    document_id      UUID REFERENCES documents.documents(document_id),
    assigned_to      UUID NOT NULL REFERENCES core.users(user_id),
    assigned_by      UUID NOT NULL REFERENCES core.users(user_id),
    priority         VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'
                     CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    due_date         TIMESTAMPTZ,
    status           VARCHAR(30) NOT NULL DEFAULT 'CREATED'
                     CHECK (status IN ('CREATED', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'REVIEWED', 'CLOSED')),
    closed_at        TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_assigned_to ON core.tasks(assigned_to);
CREATE INDEX idx_tasks_meeting_id ON core.tasks(meeting_id);
CREATE INDEX idx_tasks_status ON core.tasks(status);
