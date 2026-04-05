package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.InternationalBody;
import in.gov.dgs.isep.meeting.domain.Meeting;
import in.gov.dgs.isep.meeting.domain.Meeting.MeetingStatus;
import in.gov.dgs.isep.meeting.domain.Meeting.MeetingType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * L2 unit test — MeetingDto mapping (ISEP-Testing-Plan ACT-T05).
 */
class MeetingDtoTest {

    @Test
    @DisplayName("from maps Meeting to MeetingDto with all fields")
    void from_mapsMeetingToDto() {
        UUID bodyId = UUID.randomUUID();
        UUID meetingId = UUID.randomUUID();
        InternationalBody body = new InternationalBody();
        body.setBodyId(bodyId);
        body.setName("Test Body");

        Meeting meeting = new Meeting();
        meeting.setMeetingId(meetingId);
        meeting.setBody(body);
        meeting.setSessionNumber("S-2026-01");
        meeting.setTitle("Test Meeting");
        meeting.setStartDate(LocalDate.of(2026, 3, 1));
        meeting.setEndDate(LocalDate.of(2026, 3, 2));
        meeting.setLocation("Geneva");
        meeting.setMeetingType(MeetingType.IN_PERSON);
        meeting.setStatus(MeetingStatus.PLANNED);
        meeting.setNotes("Sample notes");
        meeting.setCreatedAt(Instant.parse("2026-02-01T10:00:00Z"));

        MeetingDto dto = MeetingDto.from(meeting);

        assertThat(dto.getMeetingId()).isEqualTo(meetingId);
        assertThat(dto.getBodyId()).isEqualTo(bodyId);
        assertThat(dto.getBodyName()).isEqualTo("Test Body");
        assertThat(dto.getSessionNumber()).isEqualTo("S-2026-01");
        assertThat(dto.getTitle()).isEqualTo("Test Meeting");
        assertThat(dto.getStartDate()).isEqualTo(LocalDate.of(2026, 3, 1));
        assertThat(dto.getEndDate()).isEqualTo(LocalDate.of(2026, 3, 2));
        assertThat(dto.getLocation()).isEqualTo("Geneva");
        assertThat(dto.getMeetingType()).isEqualTo("IN_PERSON");
        assertThat(dto.getStatus()).isEqualTo("PLANNED");
        assertThat(dto.getNotes()).isEqualTo("Sample notes");
        assertThat(dto.getCreatedAt()).isEqualTo(Instant.parse("2026-02-01T10:00:00Z"));
    }
}
