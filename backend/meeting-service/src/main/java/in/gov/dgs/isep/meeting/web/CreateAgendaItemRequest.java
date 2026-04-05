package in.gov.dgs.isep.meeting.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public class CreateAgendaItemRequest {

    @Size(max = 50)
    private String itemNumber;

    @NotBlank
    @Size(max = 1000)
    private String title;

    private String description;

    @Size(max = 50)
    private String category;

    @Size(max = 20)
    private String priority;

    @Size(max = 20)
    private String status = "DRAFT";

    private Instant deadlineForInputs;

    private UUID assignedCoordinatorId;

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
