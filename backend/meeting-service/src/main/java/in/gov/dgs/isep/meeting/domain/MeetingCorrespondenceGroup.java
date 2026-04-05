package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "meeting_correspondence_groups", schema = "core")
@IdClass(MeetingCorrespondenceGroupId.class)
public class MeetingCorrespondenceGroup {

    @Id
    @Column(name = "meeting_id", nullable = false)
    private UUID meetingId;

    @Id
    @Column(name = "cg_id", nullable = false)
    private UUID cgId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meeting_id", nullable = false, insertable = false, updatable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cg_id", nullable = false, insertable = false, updatable = false)
    private CorrespondenceGroup correspondenceGroup;

    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }

    public UUID getCgId() { return cgId; }
    public void setCgId(UUID cgId) { this.cgId = cgId; }

    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) {
        this.meeting = meeting;
        this.meetingId = meeting != null ? meeting.getMeetingId() : null;
    }

    public CorrespondenceGroup getCorrespondenceGroup() { return correspondenceGroup; }
    public void setCorrespondenceGroup(CorrespondenceGroup correspondenceGroup) {
        this.correspondenceGroup = correspondenceGroup;
        this.cgId = correspondenceGroup != null ? correspondenceGroup.getCgId() : null;
    }
}
