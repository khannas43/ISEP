package in.gov.dgs.isep.meeting.web;

import java.time.Instant;
import java.util.UUID;

public record DiffChunkDto(
        int changeIndex,
        String type,
        String text,
        UUID author,
        String authorName,
        Instant timestamp,
        String decision
) {}
