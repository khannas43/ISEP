package in.gov.dgs.isep.meeting.web;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Partial update for a meeting. All fields are optional; only non-null fields are applied.
 */
public class UpdateMeetingRequest {

    private UUID bodyId;
    private String sessionNumber;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
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
