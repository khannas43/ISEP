package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications", schema = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "notification_id")
    private UUID notificationId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_user_id", nullable = false)
    private User recipientUser;

    @Column(name = "notification_type", nullable = false, length = 100)
    private String notificationType;

    @Column(length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "linked_entity_type", length = 100)
    private String linkedEntityType;

    @Column(name = "linked_entity_id", length = 255)
    private String linkedEntityId;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "delivered_in_portal_at")
    private Instant deliveredInPortalAt;

    @Column(name = "delivered_email_at")
    private Instant deliveredEmailAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Notification() {}

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getNotificationId() { return notificationId; }
    public void setNotificationId(UUID notificationId) { this.notificationId = notificationId; }
    public User getRecipientUser() { return recipientUser; }
    public void setRecipientUser(User recipientUser) { this.recipientUser = recipientUser; }
    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getLinkedEntityType() { return linkedEntityType; }
    public void setLinkedEntityType(String linkedEntityType) { this.linkedEntityType = linkedEntityType; }
    public String getLinkedEntityId() { return linkedEntityId; }
    public void setLinkedEntityId(String linkedEntityId) { this.linkedEntityId = linkedEntityId; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean read) { isRead = read; }
    public Instant getDeliveredInPortalAt() { return deliveredInPortalAt; }
    public void setDeliveredInPortalAt(Instant deliveredInPortalAt) { this.deliveredInPortalAt = deliveredInPortalAt; }
    public Instant getDeliveredEmailAt() { return deliveredEmailAt; }
    public void setDeliveredEmailAt(Instant deliveredEmailAt) { this.deliveredEmailAt = deliveredEmailAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
