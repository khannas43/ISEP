package in.gov.dgs.isep.meeting.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class MeetingCorrespondenceGroupId implements Serializable {

    private UUID meetingId;
    private UUID cgId;

    public MeetingCorrespondenceGroupId() {}

    public MeetingCorrespondenceGroupId(UUID meetingId, UUID cgId) {
        this.meetingId = meetingId;
        this.cgId = cgId;
    }

    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }
    public UUID getCgId() { return cgId; }
    public void setCgId(UUID cgId) { this.cgId = cgId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MeetingCorrespondenceGroupId that = (MeetingCorrespondenceGroupId) o;
        return Objects.equals(meetingId, that.meetingId) && Objects.equals(cgId, that.cgId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(meetingId, cgId);
    }
}
