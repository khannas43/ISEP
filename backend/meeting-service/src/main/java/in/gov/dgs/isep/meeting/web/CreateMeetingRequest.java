package in.gov.dgs.isep.meeting.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public class CreateMeetingRequest {

    @NotNull
    private UUID bodyId;

    private String sessionNumber;

    @NotBlank
    private String title;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String location;

    @NotNull
    private String meetingType;

    private String notes;

    public UUID getBodyId() { return bodyId; }
    public void setBodyId(UUID bodyId) { this.bodyId = bodyId; }
    public String getSessionNumber() { return sessionNumber; }
    public void setSessionNumber(String sessionNumber) { this.sessionNumber = sessionNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getMeetingType() { return meetingType; }
    public void setMeetingType(String meetingType) { this.meetingType = meetingType; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
