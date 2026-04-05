package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.LivePost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LivePostRepository extends JpaRepository<LivePost, UUID> {

    List<LivePost> findByMeetingMeetingIdAndAgendaItemAgendaItemIdOrderByPostedAtAsc(UUID meetingId, UUID agendaItemId);
}
