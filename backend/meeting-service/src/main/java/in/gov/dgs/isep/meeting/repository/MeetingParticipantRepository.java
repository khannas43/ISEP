package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.MeetingParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MeetingParticipantRepository extends JpaRepository<MeetingParticipant, UUID> {

    long countByMeetingMeetingId(UUID meetingId);

    List<MeetingParticipant> findByMeetingMeetingIdOrderByAssignedAtAsc(UUID meetingId);

    boolean existsByMeetingMeetingIdAndUserUserId(UUID meetingId, UUID userId);

    Optional<MeetingParticipant> findByMeetingMeetingIdAndUserUserId(UUID meetingId, UUID userId);

    List<MeetingParticipant> findByUserUserId(UUID userId);
}
