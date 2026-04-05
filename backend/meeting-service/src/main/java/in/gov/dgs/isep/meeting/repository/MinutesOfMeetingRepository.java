package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.MinutesOfMeeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MinutesOfMeetingRepository extends JpaRepository<MinutesOfMeeting, UUID> {

    Optional<MinutesOfMeeting> findByMeetingMeetingId(UUID meetingId);
}
