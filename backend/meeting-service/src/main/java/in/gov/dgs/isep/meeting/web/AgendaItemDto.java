package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.AgendaItem;

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
    private String assignedCoordinatorName;
    private Integer inputsReceivedCount;
    private boolean discussionLocked;

    public static AgendaItemDto from(AgendaItem a) {
        AgendaItemDto dto = new AgendaItemDto();
        dto.agendaItemId = a.getAgendaItemId();
        dto.meetingId = a.getMeeting().getMeetingId();
        dto.itemNumber = a.getItemNumber();
        dto.title = a.getTitle();
        dto.description = a.getDescription();
        dto.category = a.getCategory();
        dto.priority = a.getPriority();
        dto.status = a.getStatus();
        dto.deadlineForInputs = a.getDeadlineForInputs();
        if (a.getAssignedCoordinator() != null) {
            dto.assignedCoordinatorId = a.getAssignedCoordinator().getUserId();
            dto.assignedCoordinatorName = a.getAssignedCoordinator().getFullName();
        }
        dto.inputsReceivedCount = 0;
        dto.discussionLocked = a.isDiscussionLocked();
        return dto;
    }

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
    public String getAssignedCoordinatorName() { return assignedCoordinatorName; }
    public void setAssignedCoordinatorName(String assignedCoordinatorName) { this.assignedCoordinatorName = assignedCoordinatorName; }
    public Integer getInputsReceivedCount() { return inputsReceivedCount; }
    public void setInputsReceivedCount(Integer inputsReceivedCount) { this.inputsReceivedCount = inputsReceivedCount; }
    public boolean isDiscussionLocked() { return discussionLocked; }
    public void setDiscussionLocked(boolean discussionLocked) { this.discussionLocked = discussionLocked; }
}
