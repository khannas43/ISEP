package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.Announcement;
import in.gov.dgs.isep.meeting.service.AnnouncementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * System announcements API (SCR-CAL-04). Create as DRAFT; publish to broadcast (pinned banner, email in production).
 */
@RestController
@RequestMapping("/api/v1/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<Page<AnnouncementDto>> list(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(announcementService.list(pageable).map(AnnouncementDto::from));
    }

    @Transactional
    @PostMapping
    public ResponseEntity<AnnouncementDto> create(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID createdBy = parseUserId(jwt != null ? jwt.getSubject() : null);
        String subject = body != null ? body.get("subject") : null;
        String msgBody = body != null ? body.get("body") : null;
        String urgency = body != null ? body.get("urgency") : "INFORMATIONAL";
        String scope = body != null ? body.get("scope") : "ALL_USERS";
        String scopeValue = body != null ? body.get("scopeValue") : null;
        if (subject == null || subject.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Announcement a = announcementService.create(
                subject.trim(),
                msgBody != null ? msgBody : "",
                urgency,
                scope,
                scopeValue,
                createdBy
        );
        return ResponseEntity.ok(AnnouncementDto.from(a));
    }

    @Transactional
    @PostMapping("/{id}/publish")
    public ResponseEntity<AnnouncementDto> publish(@PathVariable UUID id) {
        Announcement a = announcementService.publish(id);
        return ResponseEntity.ok(AnnouncementDto.from(a));
    }

    private static UUID parseUserId(String sub) {
        if (sub == null || sub.isBlank()) return null;
        try {
            return UUID.fromString(sub);
        } catch (Exception e) {
            return null;
        }
    }

    public static class AnnouncementDto {
        private UUID announcementId;
        private String subject;
        private String body;
        private String urgency;
        private String scope;
        private String scopeValue;
        private String status;
        private String publishedAt;
        private String createdAt;

        public static AnnouncementDto from(Announcement a) {
            AnnouncementDto dto = new AnnouncementDto();
            dto.announcementId = a.getAnnouncementId();
            dto.subject = a.getSubject();
            dto.body = a.getBody();
            dto.urgency = a.getUrgency();
            dto.scope = a.getScope();
            dto.scopeValue = a.getScopeValue();
            dto.status = a.getStatus();
            dto.publishedAt = a.getPublishedAt() != null ? a.getPublishedAt().toString() : null;
            dto.createdAt = a.getCreatedAt() != null ? a.getCreatedAt().toString() : null;
            return dto;
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
        public String getPublishedAt() { return publishedAt; }
        public void setPublishedAt(String publishedAt) { this.publishedAt = publishedAt; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }
}
