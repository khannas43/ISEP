package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.MeetingIntervention;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingInterventionRepository extends JpaRepository<MeetingIntervention, UUID> {

    List<MeetingIntervention> findByMeetingMeetingIdOrderByDeliveredAtDesc(UUID meetingId);
}
