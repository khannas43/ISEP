-- Feedback position filter labels (SCR-COL archive UI); codes match collaboration.feedback.position values.
INSERT INTO core.reference_data (category, code, label, sort_order) VALUES
('feedback_position', 'SUPPORT', 'Support', 1),
('feedback_position', 'OBJECT', 'Object', 2),
('feedback_position', 'NEUTRAL', 'Neutral', 3),
('feedback_position', 'ABSTAIN', 'Abstain', 4),
('feedback_position', 'CONDITIONAL_SUPPORT', 'Conditional support', 5)
ON CONFLICT (category, code) DO UPDATE SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order;
