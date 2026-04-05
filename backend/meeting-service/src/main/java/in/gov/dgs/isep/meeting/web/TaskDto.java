package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.Task;

import java.time.Instant;
import java.util.UUID;

public class TaskDto {

    private UUID taskId;
    private UUID meetingId;
    private UUID agendaItemId;
    private UUID documentId;
    private String title;
    private String description;
    private UUID assignedToId;
    private String assignedToName;
    private String priority;
    private Instant dueDate;
    private String status;

    public static TaskDto from(Task t) {
        TaskDto dto = new TaskDto();
        dto.taskId = t.getTaskId();
        dto.meetingId = t.getMeeting() != null ? t.getMeeting().getMeetingId() : null;
        dto.agendaItemId = t.getAgendaItem() != null ? t.getAgendaItem().getAgendaItemId() : null;
        dto.documentId = t.getDocument() != null ? t.getDocument().getDocumentId() : null;
        dto.title = t.getTitle();
        dto.description = t.getDescription();
        dto.assignedToId = t.getAssignedTo() != null ? t.getAssignedTo().getUserId() : null;
        dto.assignedToName = t.getAssignedTo() != null ? t.getAssignedTo().getFullName() : null;
        dto.priority = t.getPriority();
        dto.dueDate = t.getDueDate();
        dto.status = t.getStatus();
        return dto;
    }

    public UUID getTaskId() { return taskId; }
    public void setTaskId(UUID taskId) { this.taskId = taskId; }
    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }
    public UUID getAgendaItemId() { return agendaItemId; }
    public void setAgendaItemId(UUID agendaItemId) { this.agendaItemId = agendaItemId; }
    public UUID getDocumentId() { return documentId; }
    public void setDocumentId(UUID documentId) { this.documentId = documentId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public UUID getAssignedToId() { return assignedToId; }
    public void setAssignedToId(UUID assignedToId) { this.assignedToId = assignedToId; }
    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public Instant getDueDate() { return dueDate; }
    public void setDueDate(Instant dueDate) { this.dueDate = dueDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
