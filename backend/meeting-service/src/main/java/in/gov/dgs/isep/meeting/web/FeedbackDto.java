package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.Feedback;

import java.time.Instant;
import java.util.UUID;

public class FeedbackDto {

    private UUID feedbackId;
    private UUID agendaItemId;
    private UUID documentId;
    private UUID userId;
    private String userName;
    private String position;
    private String comments;
    private String suggestedAmendments;
    private String status;
    private Instant submittedAt;
    private UUID reviewedBy;
    private Instant reviewedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public static FeedbackDto from(Feedback f) {
        FeedbackDto dto = new FeedbackDto();
        dto.feedbackId = f.getFeedbackId();
        dto.agendaItemId = f.getAgendaItem() != null ? f.getAgendaItem().getAgendaItemId() : null;
        dto.documentId = f.getDocument() != null ? f.getDocument().getDocumentId() : null;
        dto.userId = f.getUser() != null ? f.getUser().getUserId() : null;
        dto.userName = f.getUser() != null ? f.getUser().getFullName() : null;
        dto.position = f.getPosition();
        dto.comments = f.getComments();
        dto.suggestedAmendments = f.getSuggestedAmendments();
        dto.status = f.getStatus();
        dto.submittedAt = f.getSubmittedAt();
        dto.reviewedBy = f.getReviewedBy() != null ? f.getReviewedBy().getUserId() : null;
        dto.reviewedAt = f.getReviewedAt();
        dto.createdAt = f.getCreatedAt();
        dto.updatedAt = f.getUpdatedAt();
        return dto;
    }

    public UUID getFeedbackId() { return feedbackId; }
    public void setFeedbackId(UUID feedbackId) { this.feedbackId = feedbackId; }
    public UUID getAgendaItemId() { return agendaItemId; }
    public void setAgendaItemId(UUID agendaItemId) { this.agendaItemId = agendaItemId; }
    public UUID getDocumentId() { return documentId; }
    public void setDocumentId(UUID documentId) { this.documentId = documentId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public String getSuggestedAmendments() { return suggestedAmendments; }
    public void setSuggestedAmendments(String suggestedAmendments) { this.suggestedAmendments = suggestedAmendments; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    public UUID getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(UUID reviewedBy) { this.reviewedBy = reviewedBy; }
    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
