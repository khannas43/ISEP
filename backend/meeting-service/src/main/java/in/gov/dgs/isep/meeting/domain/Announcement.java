package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * System announcement (SCR-CAL-04). Published items shown as pinned banner and optionally emailed.
 */
@Entity
@Table(name = "announcements", schema = "core")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "announcement_id")
    private UUID announcementId;

    @Column(nullable = false, length = 500)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false, length = 20)
    private String urgency = "INFORMATIONAL";

    @Column(nullable = false, length = 50)
    private String scope = "ALL_USERS";

    @Column(name = "scope_value", length = 500)
    private String scopeValue;

    @Column(nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getAnnouncementId() { return announcementId; }
    public void setAnnouncementId(UUID announcementId) { this.announcementId = announcementId; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }
    public String getScopeValue() { return scopeValue; }
    public void setScopeValue(String scopeValue) { this.scopeValue = scopeValue; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
