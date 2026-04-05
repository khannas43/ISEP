package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.AgendaItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgendaItemRepository extends JpaRepository<AgendaItem, UUID> {

    List<AgendaItem> findByMeetingMeetingIdOrderByItemNumberAsc(UUID meetingId);

    long countByMeetingMeetingId(UUID meetingId);

    Optional<AgendaItem> findByAgendaItemIdAndMeeting_MeetingId(UUID agendaItemId, UUID meetingId);
}
