package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.TaskAssignee;
import in.gov.dgs.isep.meeting.domain.TaskAssigneeId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TaskAssigneeRepository extends JpaRepository<TaskAssignee, TaskAssigneeId> {

    List<TaskAssignee> findById_UserId(UUID userId);

    List<TaskAssignee> findById_TaskId(UUID taskId);
}
