package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/** JPA entity for collaboration.feedback. One per user per agenda item; position (SUPPORT/OBJECT/NEUTRAL/ABSTAIN), status DRAFT → SUBMITTED → REVIEWED. */
@Entity
@Table(name = "feedback", schema = "collaboration")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "feedback_id")
    private UUID feedbackId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "agenda_item_id", nullable = false)
    private AgendaItem agendaItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 20)
    private String position;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "suggested_amendments", columnDefinition = "TEXT")
    private String suggestedAmendments;

    @Column(nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Feedback() {}

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getFeedbackId() { return feedbackId; }
    public void setFeedbackId(UUID feedbackId) { this.feedbackId = feedbackId; }
    public AgendaItem getAgendaItem() { return agendaItem; }
    public void setAgendaItem(AgendaItem agendaItem) { this.agendaItem = agendaItem; }
    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
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
    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
