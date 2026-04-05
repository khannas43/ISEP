package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.Paper;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaperRepository extends JpaRepository<Paper, UUID> {

    List<Paper> findByMeetingMeetingId(UUID meetingId);
}
