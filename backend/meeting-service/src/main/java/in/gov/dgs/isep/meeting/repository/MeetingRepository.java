package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.Meeting;
import in.gov.dgs.isep.meeting.domain.Meeting.MeetingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Spring Data JPA repository for Meeting. findByIdWithBody eagerly loads body (for CG assignment logic). */
public interface MeetingRepository extends JpaRepository<Meeting, UUID> {

    /** Eagerly load body so meeting.getBody() is available without extra query (e.g. for correspondence group assignment). */
    @Query("SELECT m FROM Meeting m LEFT JOIN FETCH m.body WHERE m.meetingId = :id")
    Optional<Meeting> findByIdWithBody(@Param("id") UUID id);

    Page<Meeting> findByBodyBodyId(UUID bodyId, Pageable pageable);

    Page<Meeting> findByStatus(MeetingStatus status, Pageable pageable);

    @Query("SELECT m FROM Meeting m WHERE m.body.bodyId = :bodyId AND m.status IN :statuses")
    Page<Meeting> findByBodyIdAndStatusIn(UUID bodyId, java.util.List<MeetingStatus> statuses, Pageable pageable);

    @Query("SELECT m FROM Meeting m WHERE LOWER(m.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(COALESCE(m.sessionNumber, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(COALESCE(m.location, '')) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(COALESCE(m.notes, '')) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Meeting> searchByTitleOrSessionNumber(@Param("q") String q, Pageable pageable);

    @Query("SELECT m FROM Meeting m JOIN FETCH m.body WHERE m.startDate >= :today ORDER BY m.startDate ASC")
    List<Meeting> findUpcomingFrom(@Param("today") LocalDate today, Pageable pageable);
}
