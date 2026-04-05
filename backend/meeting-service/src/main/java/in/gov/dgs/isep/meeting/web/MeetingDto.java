package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.Meeting;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class MeetingDto {

    private UUID meetingId;
    private UUID bodyId;
    private String bodyName;
    private String sessionNumber;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private String meetingType;
    private String status;
    private String notes;
    private Instant createdAt;
    private boolean liveSessionActive;
    private Instant liveSessionStartedAt;

    public static MeetingDto from(Meeting m) {
        MeetingDto dto = new MeetingDto();
        dto.meetingId = m.getMeetingId();
        dto.bodyId = m.getBody().getBodyId();
        dto.bodyName = m.getBody().getName();
        dto.sessionNumber = m.getSessionNumber();
        dto.title = m.getTitle();
        dto.startDate = m.getStartDate();
        dto.endDate = m.getEndDate();
        dto.location = m.getLocation();
        dto.meetingType = m.getMeetingType().name();
        dto.status = m.getStatus().name();
        dto.notes = m.getNotes();
        dto.createdAt = m.getCreatedAt();
        dto.liveSessionActive = m.isLiveSessionActive();
        dto.liveSessionStartedAt = m.getLiveSessionStartedAt();
        return dto;
    }

    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }
    public UUID getBodyId() { return bodyId; }
    public void setBodyId(UUID bodyId) { this.bodyId = bodyId; }
    public String getBodyName() { return bodyName; }
    public void setBodyName(String bodyName) { this.bodyName = bodyName; }

    /** Alias for UI (committee / body short label); same value as {@link #getBodyName()}. */
    public String getCommitteeShortName() {
        return bodyName;
    }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public boolean isLiveSessionActive() { return liveSessionActive; }
    public void setLiveSessionActive(boolean liveSessionActive) { this.liveSessionActive = liveSessionActive; }
    public Instant getLiveSessionStartedAt() { return liveSessionStartedAt; }
    public void setLiveSessionStartedAt(Instant liveSessionStartedAt) { this.liveSessionStartedAt = liveSessionStartedAt; }
}
