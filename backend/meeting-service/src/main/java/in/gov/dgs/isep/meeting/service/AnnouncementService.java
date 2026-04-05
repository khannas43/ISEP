package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.Announcement;
import in.gov.dgs.isep.meeting.repository.AnnouncementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * System announcements (SCR-CAL-04). Create as DRAFT, then publish to show as pinned banner and optionally email.
 */
@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @Transactional(readOnly = true)
    public Page<Announcement> list(Pageable pageable) {
        return announcementRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public Announcement create(String subject, String body, String urgency, String scope, String scopeValue, UUID createdBy) {
        Announcement a = new Announcement();
        a.setSubject(subject);
        a.setBody(body);
        a.setUrgency(urgency != null ? urgency : "INFORMATIONAL");
        a.setScope(scope != null ? scope : "ALL_USERS");
        a.setScopeValue(scopeValue);
        a.setStatus("DRAFT");
        a.setCreatedBy(createdBy);
        a.setCreatedAt(Instant.now());
        return announcementRepository.save(a);
    }

    @Transactional
    public Announcement publish(UUID announcementId) {
        Announcement a = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        a.setStatus("PUBLISHED");
        a.setPublishedAt(Instant.now());
        return announcementRepository.save(a);
    }
}
