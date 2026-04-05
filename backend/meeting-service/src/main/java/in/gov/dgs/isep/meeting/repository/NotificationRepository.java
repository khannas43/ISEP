package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByRecipientUserUserIdOrderByCreatedAtDesc(UUID recipientUserId, Pageable pageable);

    Page<Notification> findByRecipientUserUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID recipientUserId, Pageable pageable);

    long countByRecipientUserUserIdAndIsReadFalse(UUID recipientUserId);
}
