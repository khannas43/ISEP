package in.gov.dgs.isep.meeting.web;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DiffResponse(
        UUID documentId,
        int fromVersion,
        int toVersion,
        Instant fromSavedAt,
        Instant toSavedAt,
        List<DiffChunkDto> changes
) {}
