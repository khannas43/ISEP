package in.gov.dgs.isep.agenda.web;

import java.time.Instant;
import java.util.UUID;

public class AgendaItemDto {
    private UUID agendaItemId;
    private UUID meetingId;
    private String itemNumber;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private Instant deadlineForInputs;
    private UUID assignedCoordinatorId;

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
}
