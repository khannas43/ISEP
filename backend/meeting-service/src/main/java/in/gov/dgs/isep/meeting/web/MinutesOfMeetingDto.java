package in.gov.dgs.isep.meeting.web;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public record MinutesOfMeetingDto(
        UUID id,
        UUID meetingId,
        String meetingTitle,
        Instant generatedAt,
        int attendeeCount,
        int agendaItemsCovered,
        String contentHtml,
        JsonNode actionItems,
        String status
) {}
