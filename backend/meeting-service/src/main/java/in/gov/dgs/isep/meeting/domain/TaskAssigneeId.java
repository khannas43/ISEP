package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class TaskAssigneeId implements Serializable {

    @Column(name = "task_id")
    private UUID taskId;

    @Column(name = "user_id")
    private UUID userId;

    public TaskAssigneeId() {}

    public TaskAssigneeId(UUID taskId, UUID userId) {
        this.taskId = taskId;
        this.userId = userId;
    }

    public UUID getTaskId() { return taskId; }
    public void setTaskId(UUID taskId) { this.taskId = taskId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TaskAssigneeId that = (TaskAssigneeId) o;
        return Objects.equals(taskId, that.taskId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(taskId, userId);
    }
}
