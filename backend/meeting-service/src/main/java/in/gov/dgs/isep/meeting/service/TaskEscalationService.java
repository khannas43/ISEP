package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.Task;
import in.gov.dgs.isep.meeting.domain.TaskAssignee;
import in.gov.dgs.isep.meeting.repository.TaskAssigneeRepository;
import in.gov.dgs.isep.meeting.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class TaskEscalationService {

    private final TaskRepository taskRepository;
    private final TaskAssigneeRepository taskAssigneeRepository;
    private final NotificationService notificationService;

    public TaskEscalationService(
            TaskRepository taskRepository,
            TaskAssigneeRepository taskAssigneeRepository,
            NotificationService notificationService) {
        this.taskRepository = taskRepository;
        this.taskAssigneeRepository = taskAssigneeRepository;
        this.notificationService = notificationService;
    }

    /**
     * Marks overdue PENDING/IN_PROGRESS tasks as ESCALATED and notifies assignees.
     */
    @Transactional
    public int escalateOverdue() {
        Instant now = Instant.now();
        List<Task> tasks = taskRepository.findDueOverdueForEscalation(now);
        int count = 0;
        for (Task t : tasks) {
            t.setStatus("ESCALATED");
            t.setEscalatedAt(Instant.now());
            taskRepository.save(t);
            for (UUID uid : assigneeUserIds(t)) {
                try {
                    notificationService.create(
                            uid,
                            "TASK_ESCALATED",
                            "Task escalated",
                            "Task \"" + t.getTitle() + "\" is overdue and has been escalated.",
                            "task",
                            t.getTaskId().toString()
                    );
                } catch (Exception ignored) {
                    // non-fatal
                }
            }
            count++;
        }
        return count;
    }

    private List<UUID> assigneeUserIds(Task t) {
        List<TaskAssignee> rows = taskAssigneeRepository.findById_TaskId(t.getTaskId());
        if (!rows.isEmpty()) {
            return rows.stream().map(r -> r.getId().getUserId()).distinct().toList();
        }
        if (t.getAssignedTo() != null) {
            return List.of(t.getAssignedTo().getUserId());
        }
        return List.of();
    }
}
