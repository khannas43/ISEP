package in.gov.dgs.isep.meeting.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class AddParticipantRequest {

    @NotNull
    private UUID userId;

    @NotBlank
    private String meetingRole;

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getMeetingRole() { return meetingRole; }
    public void setMeetingRole(String meetingRole) { this.meetingRole = meetingRole; }
}
