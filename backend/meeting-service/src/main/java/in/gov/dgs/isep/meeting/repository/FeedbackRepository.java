package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {

    List<Feedback> findByAgendaItemAgendaItemIdOrderByUpdatedAtDesc(UUID agendaItemId);

    Optional<Feedback> findByAgendaItemAgendaItemIdAndUserUserId(UUID agendaItemId, UUID userId);

    long countByAgendaItemAgendaItemIdIn(Collection<UUID> agendaItemIds);

    long countByAgendaItemAgendaItemIdInAndStatus(Collection<UUID> agendaItemIds, String status);

    @Query("SELECT f FROM Feedback f WHERE f.agendaItem.meeting.meetingId = :meetingId "
            + "AND (:agendaItemId IS NULL OR f.agendaItem.agendaItemId = :agendaItemId) "
            + "AND (:submittedBy IS NULL OR f.user.userId = :submittedBy) "
            + "AND (:position IS NULL OR :position = '' OR UPPER(f.position) = UPPER(:position)) "
            + "ORDER BY f.submittedAt DESC NULLS LAST, f.updatedAt DESC")
    Page<Feedback> findMeetingArchive(
            @Param("meetingId") UUID meetingId,
            @Param("agendaItemId") UUID agendaItemId,
            @Param("submittedBy") UUID submittedBy,
            @Param("position") String position,
            Pageable pageable
    );
}
