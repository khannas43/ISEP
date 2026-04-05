-- Allow COORDINATOR as a meeting participant role (aligns with TaskApiService / demo seed).
ALTER TABLE core.meeting_participants DROP CONSTRAINT IF EXISTS meeting_participants_meeting_role_check;
ALTER TABLE core.meeting_participants ADD CONSTRAINT meeting_participants_meeting_role_check
  CHECK (meeting_role IN ('DELEGATION_LEADER', 'MEMBER', 'OBSERVER', 'COORDINATOR'));
