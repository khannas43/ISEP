package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "agenda_items", schema = "core")
public class AgendaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "agenda_item_id")
    private UUID agendaItemId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(name = "item_number", length = 50)
    private String itemNumber;

    @Column(nullable = false, length = 1000)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String category;

    @Column(length = 20)
    private String priority;

    @Column(nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(name = "deadline_for_inputs")
    private Instant deadlineForInputs;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_coordinator_id")
    private User assignedCoordinator;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public AgendaItem() {}

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getAgendaItemId() { return agendaItemId; }
    public void setAgendaItemId(UUID agendaItemId) { this.agendaItemId = agendaItemId; }
    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }
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
    public User getAssignedCoordinator() { return assignedCoordinator; }
    public void setAssignedCoordinator(User assignedCoordinator) { this.assignedCoordinator = assignedCoordinator; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
