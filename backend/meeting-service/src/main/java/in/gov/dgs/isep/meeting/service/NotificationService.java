package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.Notification;
import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.repository.NotificationRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.web.NotificationDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> listForUser(UUID recipientUserId, Boolean unreadOnly, Pageable pageable) {
        Page<Notification> page = Boolean.TRUE.equals(unreadOnly)
                ? notificationRepository.findByRecipientUserUserIdAndIsReadFalseOrderByCreatedAtDesc(recipientUserId, pageable)
                : notificationRepository.findByRecipientUserUserIdOrderByCreatedAtDesc(recipientUserId, pageable);
        return page.map(NotificationDto::from);
    }

    @Transactional(readOnly = true)
    public long countUnread(UUID recipientUserId) {
        return notificationRepository.countByRecipientUserUserIdAndIsReadFalse(recipientUserId);
    }

    @Transactional(readOnly = true)
    public NotificationDto get(UUID notificationId, UUID recipientUserId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        if (!n.getRecipientUser().getUserId().equals(recipientUserId)) {
            throw new RuntimeException("Notification not found: " + notificationId);
        }
        return NotificationDto.from(n);
    }

    @Transactional
    public NotificationDto markRead(UUID notificationId, UUID recipientUserId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        if (!n.getRecipientUser().getUserId().equals(recipientUserId)) {
            throw new RuntimeException("Notification not found: " + notificationId);
        }
        n.setIsRead(true);
        n.setDeliveredInPortalAt(n.getDeliveredInPortalAt() != null ? n.getDeliveredInPortalAt() : Instant.now());
        notificationRepository.save(n);
        return NotificationDto.from(n);
    }

    @Transactional
    public int markAllRead(UUID recipientUserId) {
        User user = userRepository.findById(recipientUserId).orElse(null);
        if (user == null) return 0;
        Page<Notification> page = notificationRepository.findByRecipientUserUserIdOrderByCreatedAtDesc(recipientUserId, PageRequest.of(0, 500));
        int count = 0;
        for (Notification n : page.getContent()) {
            if (!Boolean.TRUE.equals(n.getIsRead())) {
                n.setIsRead(true);
                if (n.getDeliveredInPortalAt() == null) n.setDeliveredInPortalAt(Instant.now());
                notificationRepository.save(n);
                count++;
            }
        }
        return count;
    }

    @Transactional
    public NotificationDto create(UUID recipientUserId, String type, String title, String message, String linkedEntityType, String linkedEntityId) {
        User recipient = userRepository.findById(recipientUserId)
                .orElseThrow(() -> new RuntimeException("User not found: " + recipientUserId));
        Notification n = new Notification();
        n.setRecipientUser(recipient);
        n.setNotificationType(type != null && !type.isBlank() ? type : "GENERIC");
        n.setTitle(title);
        n.setMessage(message);
        n.setLinkedEntityType(linkedEntityType);
        n.setLinkedEntityId(linkedEntityId);
        n.setIsRead(false);
        n.setDeliveredInPortalAt(Instant.now());
        n = notificationRepository.save(n);
        return NotificationDto.from(n);
    }
}
