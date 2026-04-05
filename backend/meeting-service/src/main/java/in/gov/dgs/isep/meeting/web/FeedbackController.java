package in.gov.dgs.isep.meeting.web;

/**
 * REST controller for agenda-item feedback (SCR-COL).
 * Base path: /api/v1/feedback
 * List by agendaItemId, get current user's feedback, get by id, save draft (POST), submit (PATCH), mark reviewed.
 * User id from JWT subject; FeedbackService may fallback to first active user if subject not in core.users (demo).
 */
import in.gov.dgs.isep.meeting.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    /** Parse JWT subject to UUID; supports Keycloak-style 32-char hex without dashes. */
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
    public ResponseEntity<List<FeedbackDto>> list(@RequestParam UUID agendaItemId) {
        return ResponseEntity.ok(feedbackService.listByAgendaItem(agendaItemId));
    }

    @Transactional(readOnly = true)
    @GetMapping("/my")
    public ResponseEntity<FeedbackDto> getMy(
            @RequestParam UUID agendaItemId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        FeedbackDto dto = feedbackService.getByAgendaItemAndUser(agendaItemId, userId);
        if (dto == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(dto);
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}")
    public ResponseEntity<FeedbackDto> get(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(feedbackService.get(id));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @PostMapping
    public ResponseEntity<FeedbackDto> saveDraft(
            @RequestBody SaveFeedbackRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (request.getAgendaItemId() == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            FeedbackDto dto = feedbackService.saveDraft(
                    request.getAgendaItemId(),
                    userId,
                    request.getPosition(),
                    request.getComments(),
                    request.getSuggestedAmendments(),
                    request.getDocumentId()
            );
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @PatchMapping("/{id}/submit")
    public ResponseEntity<FeedbackDto> submit(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            return ResponseEntity.ok(feedbackService.submit(id, userId));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            if (e.getMessage() != null && e.getMessage().contains("Only the author")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            throw e;
        }
    }

    @PatchMapping("/{id}/reviewed")
    public ResponseEntity<FeedbackDto> markReviewed(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            return ResponseEntity.ok(feedbackService.markReviewed(id, userId));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    public static class SaveFeedbackRequest {
        private UUID agendaItemId;
        private UUID documentId;
        private String position;
        private String comments;
        private String suggestedAmendments;

        public UUID getAgendaItemId() { return agendaItemId; }
        public void setAgendaItemId(UUID agendaItemId) { this.agendaItemId = agendaItemId; }
        public UUID getDocumentId() { return documentId; }
        public void setDocumentId(UUID documentId) { this.documentId = documentId; }
        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }
        public String getComments() { return comments; }
        public void setComments(String comments) { this.comments = comments; }
        public String getSuggestedAmendments() { return suggestedAmendments; }
        public void setSuggestedAmendments(String suggestedAmendments) { this.suggestedAmendments = suggestedAmendments; }
    }
}
