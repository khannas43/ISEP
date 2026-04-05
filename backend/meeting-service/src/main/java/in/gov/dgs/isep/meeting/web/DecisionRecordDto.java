package in.gov.dgs.isep.meeting.web;

import java.time.Instant;
import java.util.UUID;

public record DecisionRecordDto(
        UUID id,
        UUID documentId,
        int fromVersion,
        int toVersion,
        int changeIndex,
        String decision,
        UUID decidedBy,
        Instant decidedAt
) {}
