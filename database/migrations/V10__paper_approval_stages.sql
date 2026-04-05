-- Paper approval stages (ACT-B07): per-paper approval pipeline for SCR-PAPER-03–05.
-- core.papers must exist (V9).

CREATE TABLE IF NOT EXISTS workflow.paper_approval_stages (
    stage_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id          UUID NOT NULL REFERENCES core.papers(paper_id) ON DELETE CASCADE,
    stage_number      INT NOT NULL,
    stage_name        VARCHAR(100) NOT NULL,
    approver_user_id  UUID REFERENCES core.users(user_id),
    status            VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'RETURNED')),
    acted_at          TIMESTAMPTZ,
    comments          TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(paper_id, stage_number)
);

CREATE INDEX idx_paper_approval_stages_paper_id ON workflow.paper_approval_stages(paper_id);
COMMENT ON TABLE workflow.paper_approval_stages IS 'Approval pipeline stages per paper (ACT-B07).';
