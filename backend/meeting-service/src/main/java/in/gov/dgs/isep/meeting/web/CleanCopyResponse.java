package in.gov.dgs.isep.meeting.web;

import java.time.Instant;
import java.util.UUID;

public record CleanCopyResponse(
        UUID documentId,
        int newVersion,
        String status,
        Instant createdAt
) {}
