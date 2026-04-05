package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.Paper;
import in.gov.dgs.isep.meeting.repository.PaperRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.service.PaperApprovalService;
import in.gov.dgs.isep.meeting.service.PaperService;
import in.gov.dgs.isep.meeting.service.PaperService.ConcurrentModificationException;
import in.gov.dgs.isep.meeting.service.PaperService.PaperDraft;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Paper API for SCR-PAPER-01/02. List, create, and draft GET/PUT.
 * One canonical draft per paper so admin and reviewers see the same content.
 */
@RestController
@RequestMapping("/api/v1/papers")
public class PaperController {

    private final PaperService paperService;
    private final PaperRepository paperRepository;
    private final PaperApprovalService paperApprovalService;
    private final UserRepository userRepository;

    public PaperController(
            PaperService paperService,
            PaperRepository paperRepository,
            PaperApprovalService paperApprovalService,
            UserRepository userRepository) {
        this.paperService = paperService;
        this.paperRepository = paperRepository;
        this.paperApprovalService = paperApprovalService;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<List<PaperListItem>> list(
            @RequestParam(required = false) Boolean awaitingMyApproval,
            @AuthenticationPrincipal Jwt jwt
    ) {
        if (Boolean.TRUE.equals(awaitingMyApproval)) {
            if (jwt == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            List<String> roles = realmRoles(jwt);
            List<PaperListItem> filtered = paperApprovalService.listPapersAwaitingMyApproval(roles).stream()
                    .map(PaperController::toListItem)
                    .toList();
            return ResponseEntity.ok(filtered);
        }
        List<PaperListItem> list = paperRepository.findAll().stream()
                .map(PaperController::toListItem)
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/workflow/submit")
    public ResponseEntity<PaperApprovalDto> submitWorkflow(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = internalUserIdFromJwt(jwt);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(paperApprovalService.submitForApproval(id, userId));
        } catch (RuntimeException e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            if (msg.contains("Only DRAFT")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            throw e;
        }
    }

    @SuppressWarnings("unchecked")
    private static List<String> realmRoles(Jwt jwt) {
        if (jwt == null) {
            return List.of();
        }
        Object ra = jwt.getClaim("realm_access");
        if (!(ra instanceof Map)) {
            return List.of();
        }
        Object roles = ((Map<String, Object>) ra).get("roles");
        if (!(roles instanceof List<?> roleList)) {
            return List.of();
        }
        List<String> out = new ArrayList<>();
        for (Object o : roleList) {
            if (o != null) {
                out.add(o.toString());
            }
        }
        return out;
    }

    @PostMapping
    public ResponseEntity<PaperListItem> create(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String title = body != null && body.get("title") != null ? body.get("title").toString() : "Untitled paper";
        UUID paperId = UUID.randomUUID();
        Paper paper = new Paper();
        paper.setPaperId(paperId);
        paper.setTitle(title);
        paper.setStatus("DRAFT");
        paperRepository.save(paper);
        return ResponseEntity.status(HttpStatus.CREATED).body(toListItem(paper));
    }

    @GetMapping("/{id}/draft")
    public ResponseEntity<PaperDraft> getDraft(@PathVariable UUID id) {
        PaperDraft draft = paperService.getDraft(id);
        if (draft == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(draft);
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/approval")
    public ResponseEntity<PaperApprovalDto> getApproval(@PathVariable UUID id) {
        try {
            paperApprovalService.ensureDefaultStages(id);
            return ResponseEntity.ok(paperApprovalService.getApproval(id));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<PaperStatusResponse> getStatus(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(paperApprovalService.getPaperStatus(id));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @PostMapping("/{id}/approval/approve")
    public ResponseEntity<PaperApprovalDto> approve(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = internalUserIdFromJwt(jwt);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String comments = body != null ? body.get("comments") : null;
        try {
            return ResponseEntity.ok(paperApprovalService.approve(id, userId, comments));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            if (e.getMessage() != null && e.getMessage().contains("No pending")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
            }
            throw e;
        }
    }

    @PostMapping("/{id}/approval/reject")
    public ResponseEntity<PaperApprovalDto> reject(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = internalUserIdFromJwt(jwt);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String comments = body != null ? body.get("comments") : null;
        try {
            return ResponseEntity.ok(paperApprovalService.reject(id, userId, comments));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            if (e.getMessage() != null && e.getMessage().contains("No pending")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
            }
            throw e;
        }
    }

    @PutMapping("/{id}/draft")
    public ResponseEntity<?> putDraft(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Object content = body.get("content");
        if (content == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "content is required"));
        }
        Integer version = body.containsKey("version") && body.get("version") != null
                ? ((Number) body.get("version")).intValue()
                : null;
        UUID lastModifiedBy = internalUserIdFromJwt(jwt);

        try {
            PaperDraft saved = paperService.saveDraft(id, content, version, lastModifiedBy);
            return ResponseEntity.ok(Map.of(
                    "content", saved.content() != null ? saved.content() : Map.of(),
                    "version", saved.version(),
                    "savedAt", saved.savedAt() != null ? saved.savedAt() : "",
                    "lastModifiedBy", saved.lastModifiedBy() != null ? saved.lastModifiedBy() : ""
            ));
        } catch (ConcurrentModificationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private static PaperListItem toListItem(Paper p) {
        String meetingId = null;
        String agendaItemId = null;
        if (p.getMeeting() != null) meetingId = p.getMeeting().getMeetingId().toString();
        if (p.getAgendaItem() != null) agendaItemId = p.getAgendaItem().getAgendaItemId().toString();
        String cleanCopyDocumentId = p.getCleanCopyDocumentId() != null ? p.getCleanCopyDocumentId().toString() : null;
        return new PaperListItem(
                p.getPaperId().toString(),
                p.getTitle() != null ? p.getTitle() : "Untitled",
                p.getStatus() != null ? p.getStatus() : "DRAFT",
                meetingId,
                agendaItemId,
                p.getDraftSavedAt() != null ? p.getDraftSavedAt().toString() : null,
                cleanCopyDocumentId
        );
    }

    private UUID internalUserIdFromJwt(Jwt jwt) {
        if (jwt == null) {
            return null;
        }
        return userRepository
                .resolveJwtSubjectToUserId(jwt.getSubject(), jwt.getClaimAsString("preferred_username"))
                .orElse(null);
    }

    public record PaperListItem(
            String paperId,
            String title,
            String status,
            String meetingId,
            String agendaItemId,
            String lastUpdated,
            String cleanCopyDocumentId
    ) {}
}
