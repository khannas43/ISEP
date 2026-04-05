package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;

/** Join rows for multi-assignee tasks (core.task_assignees). */
@Entity
@Table(name = "task_assignees", schema = "core")
public class TaskAssignee {

    @EmbeddedId
    private TaskAssigneeId id;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt = Instant.now();

    public TaskAssignee() {}

    public TaskAssignee(TaskAssigneeId id) {
        this.id = id;
    }

    public TaskAssigneeId getId() { return id; }
    public void setId(TaskAssigneeId id) { this.id = id; }
    public Instant getAssignedAt() { return assignedAt; }
    public void setAssignedAt(Instant assignedAt) { this.assignedAt = assignedAt; }
}
