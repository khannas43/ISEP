package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.Task;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByMeetingMeetingIdOrderByDueDateAsc(UUID meetingId);

    List<Task> findByAssignedTo_UserIdOrderByDueDateAsc(UUID userId);

    @Query("SELECT DISTINCT t FROM Task t WHERE t.assignedTo.userId = :uid OR EXISTS (SELECT 1 FROM TaskAssignee ta WHERE ta.id.taskId = t.taskId AND ta.id.userId = :uid)")
    List<Task> findAllForAssignee(@Param("uid") UUID uid);

    List<Task> findByMeetingMeetingIdInOrderByDueDateAsc(Collection<UUID> meetingIds);

    @Query("SELECT t FROM Task t WHERE t.status IN ('PENDING', 'IN_PROGRESS') AND t.dueDate IS NOT NULL AND t.dueDate < :now")
    List<Task> findDueOverdueForEscalation(@Param("now") Instant now);
}
