package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "consultation_agencies", schema = "documents")
public class ConsultationAgency {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consultation_id", nullable = false)
    private Consultation consultation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "agency_user_id", nullable = false)
    private User agencyUser;

    @Column(name = "agency_name", nullable = false, length = 255)
    private String agencyName;

    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "feedback_html", columnDefinition = "TEXT")
    private String feedbackHtml;

    @Column(name = "feedback_submitted_at")
    private Instant feedbackSubmittedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public ConsultationAgency() {}

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Consultation getConsultation() { return consultation; }
    public void setConsultation(Consultation consultation) { this.consultation = consultation; }
    public User getAgencyUser() { return agencyUser; }
    public void setAgencyUser(User agencyUser) { this.agencyUser = agencyUser; }
    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getFeedbackHtml() { return feedbackHtml; }
    public void setFeedbackHtml(String feedbackHtml) { this.feedbackHtml = feedbackHtml; }
    public Instant getFeedbackSubmittedAt() { return feedbackSubmittedAt; }
    public void setFeedbackSubmittedAt(Instant feedbackSubmittedAt) { this.feedbackSubmittedAt = feedbackSubmittedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
