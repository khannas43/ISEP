package in.gov.dgs.isep.meeting.web;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Body for POST /api/v1/tasks (agenda-linked task creation). */
public class CreateTaskApiRequest {

    @NotNull
    private UUID meetingId;

    @NotNull
    private UUID agendaItemId;

    private UUID documentId;

    @NotBlank
    @Size(max = 500)
    private String title;

    private String description;

    @NotEmpty
    private List<UUID> assignedTo;

    @NotNull
    @Future
    private LocalDate dueDate;

    @NotNull
    private String priority;

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
    public List<UUID> getAssignedTo() { return assignedTo; }
    public void setAssignedTo(List<UUID> assignedTo) { this.assignedTo = assignedTo; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
