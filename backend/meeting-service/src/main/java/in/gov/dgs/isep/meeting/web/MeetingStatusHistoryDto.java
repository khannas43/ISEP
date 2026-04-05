package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.MeetingStatusHistory;

import java.time.Instant;
import java.util.UUID;

public class MeetingStatusHistoryDto {

    private UUID entryId;
    private UUID meetingId;
    private String fromStatus;
    private String toStatus;
    private UUID changedBy;
    private String changedByName;
    private Instant changedAt;
    private String notes;

    public static MeetingStatusHistoryDto from(MeetingStatusHistory e) {
        MeetingStatusHistoryDto dto = new MeetingStatusHistoryDto();
        dto.entryId = e.getEntryId();
        dto.meetingId = e.getMeeting().getMeetingId();
        dto.fromStatus = e.getFromStatus();
        dto.toStatus = e.getToStatus();
        dto.changedBy = e.getChangedBy() != null ? e.getChangedBy().getUserId() : null;
        dto.changedByName = e.getChangedBy() != null ? e.getChangedBy().getFullName() : null;
        dto.changedAt = e.getChangedAt();
        dto.notes = e.getNotes();
        return dto;
    }

    public UUID getEntryId() { return entryId; }
    public void setEntryId(UUID entryId) { this.entryId = entryId; }
    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }
    public String getFromStatus() { return fromStatus; }
    public void setFromStatus(String fromStatus) { this.fromStatus = fromStatus; }
    public String getToStatus() { return toStatus; }
    public void setToStatus(String toStatus) { this.toStatus = toStatus; }
    public UUID getChangedBy() { return changedBy; }
    public void setChangedBy(UUID changedBy) { this.changedBy = changedBy; }
    public String getChangedByName() { return changedByName; }
    public void setChangedByName(String changedByName) { this.changedByName = changedByName; }
    public Instant getChangedAt() { return changedAt; }
    public void setChangedAt(Instant changedAt) { this.changedAt = changedAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
