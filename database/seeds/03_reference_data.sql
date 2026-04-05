-- Reference data for dropdowns. All values must come from DB (project ground rule).
-- Idempotent: ON CONFLICT DO UPDATE so re-run is safe.

INSERT INTO core.reference_data (category, code, label, sort_order) VALUES
-- Meeting type (meetings.meeting_type)
('meeting_type', 'IN_PERSON', 'In person', 1),
('meeting_type', 'VIRTUAL', 'Virtual', 2),
('meeting_type', 'HYBRID', 'Hybrid', 3),
-- Meeting status (meetings.status)
('meeting_status', 'PLANNED', 'Planned', 1),
('meeting_status', 'ACTIVE', 'Active', 2),
('meeting_status', 'CONCLUDED', 'Concluded', 3),
('meeting_status', 'ARCHIVED', 'Archived', 4),
('meeting_status', 'CANCELLED', 'Cancelled', 5),
-- Body type (international_bodies.body_type)
('body_type', 'ASSEMBLY', 'Assembly', 1),
('body_type', 'COUNCIL', 'Council', 2),
('body_type', 'COMMITTEE', 'Committee', 3),
('body_type', 'SUB_COMMITTEE', 'Sub-Committee', 4),
('body_type', 'WORKING_GROUP', 'Working Group', 5),
('body_type', 'CORRESPONDENCE_GROUP', 'Correspondence Group', 6),
('body_type', 'BILATERAL', 'Bilateral', 7),
('body_type', 'OTHER', 'Other', 8),
-- Agenda item category
('agenda_category', 'DISCUSSION', 'Discussion', 1),
('agenda_category', 'DECISION', 'Decision', 2),
('agenda_category', 'INFORMATION', 'Information', 3),
('agenda_category', 'ANY_OTHER_BUSINESS', 'Any Other Business', 4),
-- Agenda item priority
('agenda_priority', 'HIGH', 'High', 1),
('agenda_priority', 'MEDIUM', 'Medium', 2),
('agenda_priority', 'LOW', 'Low', 3),
-- Agenda item status
('agenda_status', 'DRAFT', 'Draft', 1),
('agenda_status', 'ACTIVE', 'Active', 2),
('agenda_status', 'CLOSED', 'Closed', 3),
-- Filter years (for list filters; values from DB)
('filter_year', '2022', '2022', 1),
('filter_year', '2023', '2023', 2),
('filter_year', '2024', '2024', 3),
('filter_year', '2025', '2025', 4),
('filter_year', '2026', '2026', 5),
('filter_year', '2027', '2027', 6),
-- Meeting participant role (meeting_participants.meeting_role)
('meeting_role', 'DELEGATION_LEADER', 'Delegation Leader', 1),
('meeting_role', 'MEMBER', 'Member', 2),
('meeting_role', 'OBSERVER', 'Observer', 3),
-- Feedback position (collaboration.feedback.position; archive filter)
('feedback_position', 'SUPPORT', 'Support', 1),
('feedback_position', 'OBJECT', 'Object', 2),
('feedback_position', 'NEUTRAL', 'Neutral', 3),
('feedback_position', 'ABSTAIN', 'Abstain', 4),
('feedback_position', 'CONDITIONAL_SUPPORT', 'Conditional support', 5)
ON CONFLICT (category, code) DO UPDATE SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order;
