package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private static UUID parseUserId(String sub) {
        if (sub == null || sub.isBlank()) return null;
        try {
            if (sub.length() == 32 && !sub.contains("-")) {
                return UUID.fromString(sub.replaceFirst("(\\w{8})(\\w{4})(\\w{4})(\\w{4})(\\w{12})", "$1-$2-$3-$4-$5"));
            }
            return UUID.fromString(sub);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<Page<NotificationDto>> list(
            @RequestParam(required = false) Boolean unreadOnly,
            @PageableDefault(size = 50) Pageable pageable,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(notificationService.listForUser(userId, unreadOnly, pageable));
    }

    /** Returns unread count for current user. Never 500: returns 0 when unauthenticated or on any error (sidebar must not break). */
    @Transactional(readOnly = true)
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        if (userId == null) return ResponseEntity.ok(Map.of("count", 0L));
        try {
            long count = notificationService.countUnread(userId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("count", 0L));
        }
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}")
    public ResponseEntity<NotificationDto> get(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            return ResponseEntity.ok(notificationService.get(id, userId));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markRead(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            return ResponseEntity.ok(notificationService.markRead(id, userId));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Map<String, Integer>> markAllRead(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        int count = notificationService.markAllRead(userId);
        return ResponseEntity.ok(Map.of("marked", count));
    }
}
