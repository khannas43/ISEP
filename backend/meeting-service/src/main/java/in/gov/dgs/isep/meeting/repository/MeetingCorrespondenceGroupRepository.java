package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.MeetingCorrespondenceGroup;
import in.gov.dgs.isep.meeting.domain.MeetingCorrespondenceGroupId;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingCorrespondenceGroupRepository extends JpaRepository<MeetingCorrespondenceGroup, MeetingCorrespondenceGroupId> {

    List<MeetingCorrespondenceGroup> findByMeetingMeetingId(UUID meetingId);

    void deleteByMeetingMeetingId(UUID meetingId);
}
