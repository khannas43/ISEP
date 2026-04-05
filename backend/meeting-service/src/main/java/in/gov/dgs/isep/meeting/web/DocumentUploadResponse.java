package in.gov.dgs.isep.meeting.web;

import java.time.Instant;
import java.util.UUID;

public record DocumentUploadResponse(
        UUID documentId,
        String fileName,
        long fileSizeBytes,
        String mimeType,
        int version,
        String status,
        UUID meetingId,
        UUID agendaItemId,
        UUID committeeId,
        Instant uploadedAt
) {}
