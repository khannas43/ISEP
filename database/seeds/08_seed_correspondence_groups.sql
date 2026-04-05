-- Sample correspondence groups (India lead dropdown and CG list). Run after 01_reference_bodies.sql and 04_seed_users.sql.
-- Body IDs from 01 (MSC=3, MEPC=4, NCSR=a, PPR=b, SDC=c, SSE=d, CCC=e, HTW=8, III=9, FAL=7). India lead: coordinator c1000000-0000-0000-0000-000000000001.
-- Idempotent: only inserts when table is empty.

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM correspondence.correspondence_groups) = 0 THEN
    INSERT INTO correspondence.correspondence_groups (cg_id, parent_body_id, name, mandate, india_lead_id, start_date, end_date, status, imso_reference)
    VALUES
      (gen_random_uuid(), 'a0000000000000000000000000000003'::uuid, 'CG on SOLAS amendments', 'Review and consolidate SOLAS amendment proposals', 'c1000000-0000-0000-0000-000000000001'::uuid, '2024-01-01', '2025-12-31', 'ACTIVE', 'MSC-CG/2024-1'),
      (gen_random_uuid(), 'a0000000000000000000000000000004'::uuid, 'CG on GHG lifecycle guidelines', 'Develop guidelines for lifecycle GHG assessment of marine fuels', 'c1000000-0000-0000-0000-000000000001'::uuid, '2024-03-01', '2025-06-30', 'ACTIVE', 'MEPC-CG/2024-2'),
      (gen_random_uuid(), 'a000000000000000000000000000000a'::uuid, 'CG on e-navigation', 'Coordinate e-navigation testbed and standards', 'c1000000-0000-0000-0000-000000000001'::uuid, '2023-06-01', '2025-12-31', 'ACTIVE', 'NCSR-CG/2023-1'),
      (gen_random_uuid(), 'a000000000000000000000000000000b'::uuid, 'CG on BWM experience-building', 'Collate experience with ballast water management systems', 'c1000000-0000-0000-0000-000000000001'::uuid, '2024-01-01', '2025-12-31', 'ACTIVE', 'PPR-CG/2024-1'),
      (gen_random_uuid(), 'a000000000000000000000000000000c'::uuid, 'CG on goal-based standards', 'Review goal-based safety standards for new ship types', 'c1000000-0000-0000-0000-000000000001'::uuid, '2023-09-01', '2025-06-30', 'ACTIVE', 'SDC-CG/2023-2'),
      (gen_random_uuid(), 'a000000000000000000000000000000d'::uuid, 'CG on LSA amendments', 'Life-saving appliances and arrangements amendments', 'c1000000-0000-0000-0000-000000000001'::uuid, '2024-06-01', '2025-12-31', 'ACTIVE', 'SSE-CG/2024-1'),
      (gen_random_uuid(), 'a000000000000000000000000000000e'::uuid, 'CG on IMSBC Code updates', 'Amendments to IMSBC Code and supporting documents', 'c1000000-0000-0000-0000-000000000001'::uuid, '2024-01-01', '2025-12-31', 'ACTIVE', 'CCC-CG/2024-1'),
      (gen_random_uuid(), 'a0000000000000000000000000000008'::uuid, 'CG on STCW model courses', 'Update model courses under STCW', 'c1000000-0000-0000-0000-000000000001'::uuid, '2023-09-01', '2025-06-30', 'CONCLUDED', 'HTW-CG/2023-1'),
      (gen_random_uuid(), 'a0000000000000000000000000000009'::uuid, 'CG on III audit scheme', 'Implementation of IMO audit scheme', 'c1000000-0000-0000-0000-000000000001'::uuid, '2024-01-01', '2025-12-31', 'ACTIVE', 'III-CG/2024-1'),
      (gen_random_uuid(), 'a0000000000000000000000000000007'::uuid, 'CG on FAL single window', 'Single window and facilitation measures', 'c1000000-0000-0000-0000-000000000001'::uuid, '2024-03-01', '2025-12-31', 'ACTIVE', 'FAL-CG/2024-1');
  END IF;
END $$;
