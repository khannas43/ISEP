package in.gov.dgs.isep.agenda.repository;

import in.gov.dgs.isep.agenda.domain.AgendaItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AgendaItemRepository extends JpaRepository<AgendaItem, UUID> {
    List<AgendaItem> findByMeetingIdOrderByItemNumberAsc(UUID meetingId);
}
