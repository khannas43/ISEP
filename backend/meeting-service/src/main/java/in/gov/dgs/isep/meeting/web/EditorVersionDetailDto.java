package in.gov.dgs.isep.meeting.web;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public record EditorVersionDetailDto(
        UUID id,
        int version,
        String contentHtml,
        JsonNode contentJson,
        EditorVersionSummaryDto.EditorUserRef savedBy,
        Instant savedAt
) {}
