-- Seed users for meeting participants and all roles (sample data). Run after migrations.
-- Idempotent: ON CONFLICT DO NOTHING. Includes SYSTEM_ADMIN and IC_DIVISION_HEAD for admin screens.

INSERT INTO core.users (user_id, keycloak_id, email, full_name, designation, organization, system_role, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000000', 'admin-sa', 'admin-sa@isep.local', 'System Admin', 'System Administrator', 'DGS', 'SYSTEM_ADMIN', true),
  ('c1000000-0000-0000-0000-000000000001', 'seed-user-1', 'coordinator@isep.local', 'Sample Coordinator', 'Coordinator', 'DGS', 'COORDINATOR', true),
  ('c1000000-0000-0000-0000-000000000002', 'seed-user-2', 'delegation.lead@isep.local', 'Sample Delegation Lead', 'Delegation Leader', 'DGS', 'DELEGATION_LEADER', true),
  ('c1000000-0000-0000-0000-000000000003', 'seed-user-3', 'member@isep.local', 'Sample Member', 'Member', 'DGS', 'MEMBER', true),
  ('c1000000-0000-0000-0000-000000000004', 'seed-user-4', 'adviser@isep.local', 'Jane Adviser', 'Technical Adviser', 'Maritime Authority', 'MEMBER', true),
  ('c1000000-0000-0000-0000-000000000005', 'seed-user-5', 'observer@isep.local', 'Alex Observer', 'Observer', 'Industry Association', 'MEMBER', true),
  ('c1000000-0000-0000-0000-000000000006', 'ic-head', 'ic.head@isep.local', 'IC Division Head', 'Division Head', 'DGS', 'IC_DIVISION_HEAD', true),
  ('c1000000-0000-0000-0000-000000000007', 'viewer-1', 'viewer@isep.local', 'Read Only Viewer', 'Viewer', 'DGS', 'VIEWER', true)
ON CONFLICT (user_id) DO NOTHING;
