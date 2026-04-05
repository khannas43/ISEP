package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.Notification;

import java.time.Instant;
import java.util.UUID;

public class NotificationDto {

    private UUID notificationId;
    private String notificationType;
    private String title;
    private String message;
    private String linkedEntityType;
    private String linkedEntityId;
    private Boolean isRead;
    private Instant createdAt;

    public static NotificationDto from(Notification n) {
        NotificationDto dto = new NotificationDto();
        dto.notificationId = n.getNotificationId();
        dto.notificationType = n.getNotificationType();
        dto.title = n.getTitle();
        dto.message = n.getMessage();
        dto.linkedEntityType = n.getLinkedEntityType();
        dto.linkedEntityId = n.getLinkedEntityId();
        dto.isRead = n.getIsRead();
        dto.createdAt = n.getCreatedAt();
        return dto;
    }

    public UUID getNotificationId() { return notificationId; }
    public void setNotificationId(UUID notificationId) { this.notificationId = notificationId; }
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
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
