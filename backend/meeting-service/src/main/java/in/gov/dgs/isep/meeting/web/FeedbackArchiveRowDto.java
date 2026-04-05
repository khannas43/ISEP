package in.gov.dgs.isep.meeting.web;

import java.time.Instant;
import java.util.UUID;

/** One row in GET /api/v1/meetings/{meetingId}/feedback/archive. */
public class FeedbackArchiveRowDto {

    private UUID feedbackId;
    private UUID agendaItemId;
    private String agendaItemTitle;
    private String agendaItemNumber;
    private SubmittedByDto submittedBy;
    private String position;
    private String comments;
    private String status;
    private Instant submittedAt;
    /** Reserved for future consolidation table; currently always null. */
    private ConsolidationDto consolidation;

    public static class SubmittedByDto {
        private UUID userId;
        private String fullName;

        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }

    public static class ConsolidationDto {
        private String consolidatedPosition;
        private String consolidatedComments;
        private String status;

        public String getConsolidatedPosition() { return consolidatedPosition; }
        public void setConsolidatedPosition(String consolidatedPosition) { this.consolidatedPosition = consolidatedPosition; }
        public String getConsolidatedComments() { return consolidatedComments; }
        public void setConsolidatedComments(String consolidatedComments) { this.consolidatedComments = consolidatedComments; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public UUID getFeedbackId() { return feedbackId; }
    public void setFeedbackId(UUID feedbackId) { this.feedbackId = feedbackId; }
    public UUID getAgendaItemId() { return agendaItemId; }
    public void setAgendaItemId(UUID agendaItemId) { this.agendaItemId = agendaItemId; }
    public String getAgendaItemTitle() { return agendaItemTitle; }
    public void setAgendaItemTitle(String agendaItemTitle) { this.agendaItemTitle = agendaItemTitle; }
    public String getAgendaItemNumber() { return agendaItemNumber; }
    public void setAgendaItemNumber(String agendaItemNumber) { this.agendaItemNumber = agendaItemNumber; }
    public SubmittedByDto getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(SubmittedByDto submittedBy) { this.submittedBy = submittedBy; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    public ConsolidationDto getConsolidation() { return consolidation; }
    public void setConsolidation(ConsolidationDto consolidation) { this.consolidation = consolidation; }
}
