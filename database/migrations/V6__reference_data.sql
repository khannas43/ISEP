-- Reference/lookup data for dropdowns and UI. All dropdown values must come from DB (project ground rule).
-- Backend exposes e.g. GET /api/v1/reference?category=meeting_type
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS core.reference_data (
    category    VARCHAR(80) NOT NULL,
    code        VARCHAR(80) NOT NULL,
    label       VARCHAR(255) NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (category, code)
);

CREATE INDEX IF NOT EXISTS idx_reference_data_category ON core.reference_data(category);

COMMENT ON TABLE core.reference_data IS 'Lookup values for dropdowns; all UI options must be served from this or domain tables (no static data in frontend).';
