package in.gov.dgs.isep.agenda.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "agenda_items")
public class AgendaItem {

    @Id
    @Column(name = "agenda_item_id")
    private UUID agendaItemId;

    @Column(name = "meeting_id", nullable = false)
    private UUID meetingId;

    @Column(name = "item_number", length = 20)
    private String itemNumber;

    @Column(name = "title")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "priority", length = 20)
    private String priority;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "deadline_for_inputs")
    private Instant deadlineForInputs;

    @Column(name = "assigned_coordinator_id")
    private UUID assignedCoordinatorId;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public UUID getAgendaItemId() { return agendaItemId; }
    public void setAgendaItemId(UUID agendaItemId) { this.agendaItemId = agendaItemId; }
    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }
    public String getItemNumber() { return itemNumber; }
    public void setItemNumber(String itemNumber) { this.itemNumber = itemNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getDeadlineForInputs() { return deadlineForInputs; }
    public void setDeadlineForInputs(Instant deadlineForInputs) { this.deadlineForInputs = deadlineForInputs; }
    public UUID getAssignedCoordinatorId() { return assignedCoordinatorId; }
    public void setAssignedCoordinatorId(UUID assignedCoordinatorId) { this.assignedCoordinatorId = assignedCoordinatorId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
