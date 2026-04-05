package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.MeetingOutcome;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingOutcomeRepository extends JpaRepository<MeetingOutcome, UUID> {

    List<MeetingOutcome> findByMeetingMeetingIdOrderByCapturedAtDesc(UUID meetingId);
}
