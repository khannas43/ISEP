package in.gov.dgs.isep.meeting.web;

import java.time.Instant;
import java.util.UUID;

public record LivePostDto(
        UUID postId,
        UUID meetingId,
        UUID agendaItemId,
        UUID postedBy,
        String postedByName,
        String content,
        String postType,
        Instant postedAt,
        boolean official
) {}
