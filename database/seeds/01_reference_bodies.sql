-- Seed reference data: IMO bodies (SRS-02, SRS-03 Module A)
-- Run after migrations. Idempotent where possible.

INSERT INTO core.international_bodies (body_id, name, abbreviation, body_type, description, is_active)
VALUES
    ('a0000000000000000000000000000001', 'Assembly', 'ASSEMBLY', 'ASSEMBLY', 'IMO Assembly', true),
    ('a0000000000000000000000000000002', 'Council', 'COUNCIL', 'COUNCIL', 'IMO Council', true),
    ('a0000000000000000000000000000003', 'Maritime Safety Committee', 'MSC', 'COMMITTEE', 'IMO MSC', true),
    ('a0000000000000000000000000000004', 'Marine Environment Protection Committee', 'MEPC', 'COMMITTEE', 'IMO MEPC', true),
    ('a0000000000000000000000000000005', 'Legal Committee', 'LEGAL', 'COMMITTEE', 'IMO Legal Committee', true),
    ('a0000000000000000000000000000006', 'Technical Cooperation Committee', 'TCC', 'COMMITTEE', 'IMO TCC', true),
    ('a0000000000000000000000000000007', 'Facilitation Committee', 'FAL', 'COMMITTEE', 'IMO FAL', true),
    ('a0000000000000000000000000000008', 'Human Element, Training and Watchkeeping', 'HTW', 'SUB_COMMITTEE', 'IMO HTW', true),
    ('a0000000000000000000000000000009', 'Implementation of IMO Instruments', 'III', 'SUB_COMMITTEE', 'IMO III', true),
    ('a000000000000000000000000000000a', 'Navigation, Communications and Search & Rescue', 'NCSR', 'SUB_COMMITTEE', 'IMO NCSR', true),
    ('a000000000000000000000000000000b', 'Pollution Prevention and Response', 'PPR', 'SUB_COMMITTEE', 'IMO PPR', true),
    ('a000000000000000000000000000000c', 'Ship Design and Construction', 'SDC', 'SUB_COMMITTEE', 'IMO SDC', true),
    ('a000000000000000000000000000000d', 'Ship Systems and Equipment', 'SSE', 'SUB_COMMITTEE', 'IMO SSE', true),
    ('a000000000000000000000000000000e', 'Carriage of Cargoes and Containers', 'CCC', 'SUB_COMMITTEE', 'IMO CCC', true)
ON CONFLICT (body_id) DO NOTHING;
