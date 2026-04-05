package in.gov.dgs.isep.meeting.web;

import java.util.UUID;

public record AnalyticsDto(
        UUID meetingId,
        String meetingTitle,
        long totalMembers,
        long participated,
        long tasksTotal,
        long tasksCompleted,
        long tasksOverdue,
        double taskCompletionRatePercent,
        long papersDraft,
        long papersApproved,
        long papersFinalised,
        Double avgApprovalDays
) {}
