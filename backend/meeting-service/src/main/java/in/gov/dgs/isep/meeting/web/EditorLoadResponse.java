package in.gov.dgs.isep.meeting.web;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.UUID;

public record EditorLoadResponse(
        UUID documentId,
        String title,
        String contentHtml,
        JsonNode contentJson,
        String ydocState,
        int version,
        String status,
        boolean isLocked,
        boolean editable
) {}
