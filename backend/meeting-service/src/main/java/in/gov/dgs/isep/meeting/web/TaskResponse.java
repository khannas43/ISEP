package in.gov.dgs.isep.meeting.web;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TaskResponse(
        UUID taskId,
        String title,
        String description,
        UUID meetingId,
        UUID agendaItemId,
        UUID documentId,
        List<UUID> assignedTo,
        Instant dueDate,
        String priority,
        String status,
        UUID createdBy,
        Instant createdAt,
        Boolean isOverdue,
        Instant escalatedAt,
        String meetingTitle
) {}
