package in.gov.dgs.isep.meeting.web;

import java.time.Instant;
import java.util.UUID;

public class MeetingParticipantDto {

    private UUID participantId;
    private UUID meetingId;
    private UUID userId;
    private String email;
    private String name;
    private String designation;
    private String organization;
    private String meetingRole;
    private Instant assignedAt;

    public static MeetingParticipantDto from(in.gov.dgs.isep.meeting.domain.MeetingParticipant p) {
        MeetingParticipantDto dto = new MeetingParticipantDto();
        dto.participantId = p.getParticipantId();
        dto.meetingId = p.getMeeting().getMeetingId();
        dto.userId = p.getUser().getUserId();
        dto.email = p.getUser().getEmail();
        dto.name = p.getUser().getFullName();
        dto.designation = p.getUser().getDesignation();
        dto.organization = p.getUser().getOrganization();
        dto.meetingRole = p.getMeetingRole();
        dto.assignedAt = p.getAssignedAt();
        return dto;
    }

    public UUID getParticipantId() { return participantId; }
    public void setParticipantId(UUID participantId) { this.participantId = participantId; }
    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public String getMeetingRole() { return meetingRole; }
    public void setMeetingRole(String meetingRole) { this.meetingRole = meetingRole; }
    public Instant getAssignedAt() { return assignedAt; }
    public void setAssignedAt(Instant assignedAt) { this.assignedAt = assignedAt; }
}
