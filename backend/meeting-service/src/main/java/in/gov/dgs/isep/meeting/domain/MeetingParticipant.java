package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "meeting_participants", schema = "core")
public class MeetingParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "participant_id")
    private UUID participantId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "meeting_role", nullable = false, length = 50)
    private String meetingRole;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt;

    public MeetingParticipant() {}

    public UUID getParticipantId() { return participantId; }
    public void setParticipantId(UUID participantId) { this.participantId = participantId; }
    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getMeetingRole() { return meetingRole; }
    public void setMeetingRole(String meetingRole) { this.meetingRole = meetingRole; }
    public Instant getAssignedAt() { return assignedAt; }
    public void setAssignedAt(Instant assignedAt) { this.assignedAt = assignedAt; }
}
