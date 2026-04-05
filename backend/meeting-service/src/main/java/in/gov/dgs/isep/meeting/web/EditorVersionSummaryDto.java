package in.gov.dgs.isep.meeting.web;

import java.time.Instant;
import java.util.UUID;

public record EditorVersionSummaryDto(
        UUID id,
        int version,
        EditorUserRef savedBy,
        Instant savedAt,
        String changeSummary
) {
    public record EditorUserRef(UUID userId, String fullName) {}
}
