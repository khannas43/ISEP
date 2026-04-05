package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.MeetingStatusHistory;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingStatusHistoryRepository extends JpaRepository<MeetingStatusHistory, UUID> {

    List<MeetingStatusHistory> findByMeetingMeetingIdOrderByChangedAtDesc(UUID meetingId);
}
