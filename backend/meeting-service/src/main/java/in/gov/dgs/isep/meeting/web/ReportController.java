package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.AuditLog;
import in.gov.dgs.isep.meeting.domain.Paper;
import in.gov.dgs.isep.meeting.domain.PaperApprovalStage;
import in.gov.dgs.isep.meeting.repository.AgendaItemRepository;
import in.gov.dgs.isep.meeting.repository.AuditLogRepository;
import in.gov.dgs.isep.meeting.repository.PaperApprovalStageRepository;
import in.gov.dgs.isep.meeting.repository.PaperRepository;
import in.gov.dgs.isep.meeting.service.MeetingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.*;

/**
 * Reporting API (ACT-B08): meeting summary, approval pipeline, audit log.
 */
@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final MeetingService meetingService;
    private final AgendaItemRepository agendaItemRepository;
    private final PaperRepository paperRepository;
    private final PaperApprovalStageRepository paperApprovalStageRepository;
    private final AuditLogRepository auditLogRepository;

    public ReportController(MeetingService meetingService,
                            AgendaItemRepository agendaItemRepository,
                            PaperRepository paperRepository,
                            PaperApprovalStageRepository paperApprovalStageRepository,
                            AuditLogRepository auditLogRepository) {
        this.meetingService = meetingService;
        this.agendaItemRepository = agendaItemRepository;
        this.paperRepository = paperRepository;
        this.paperApprovalStageRepository = paperApprovalStageRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    @GetMapping("/meeting-summary")
    public ResponseEntity<Map<String, Object>> meetingSummary(@RequestParam UUID meetingId) {
        var meeting = meetingService.findById(meetingId);
        if (meeting == null) {
            return ResponseEntity.notFound().build();
        }
        Map<String, Object> summary = new HashMap<>();
        summary.put("meetingId", meeting.getMeetingId());
        summary.put("title", meeting.getTitle());
        summary.put("bodyName", meeting.getBodyName());
        summary.put("startDate", meeting.getStartDate());
        summary.put("endDate", meeting.getEndDate());
        summary.put("status", meeting.getStatus());
        summary.put("agendaItemsCount", agendaItemRepository.countByMeetingMeetingId(meetingId));
        return ResponseEntity.ok(summary);
    }

    @Transactional(readOnly = true)
    @GetMapping("/approval-pipeline")
    public ResponseEntity<List<Map<String, Object>>> approvalPipeline() {
        List<Paper> papers = paperRepository.findAll();
        List<Map<String, Object>> pipeline = new ArrayList<>();
        for (Paper p : papers) {
            List<PaperApprovalStage> stages = paperApprovalStageRepository.findByPaperPaperIdOrderByStageNumberAsc(p.getPaperId());
            String currentStage = "DRAFT";
            String nextApprover = null;
            for (PaperApprovalStage s : stages) {
                if ("PENDING".equals(s.getStatus())) {
                    currentStage = s.getStageName();
                    nextApprover = s.getApproverUser() != null ? s.getApproverUser().getFullName() : "—";
                    break;
                }
                currentStage = s.getStageName();
            }
            if (nextApprover == null && !stages.isEmpty()) {
                nextApprover = "—";
            }
            Map<String, Object> row = new HashMap<>();
            row.put("paperId", p.getPaperId());
            row.put("title", p.getTitle());
            row.put("currentStage", currentStage);
            row.put("nextApprover", nextApprover);
            row.put("status", p.getStatus());
            pipeline.add(row);
        }
        return ResponseEntity.ok(pipeline);
    }

    @Transactional(readOnly = true)
    @GetMapping("/audit")
    public ResponseEntity<Page<AuditLogDto>> audit(
            @PageableDefault(size = 50) Pageable pageable
    ) {
        Page<AuditLog> page = auditLogRepository.findAllByOrderByTimestampDesc(pageable);
        return ResponseEntity.ok(page.map(this::toDto));
    }

    /**
     * Record an audit event (e.g. LOGIN). Any authenticated user may post.
     * User id and email are taken from the JWT.
     */
    @Transactional
    @PostMapping("/audit")
    public ResponseEntity<Void> recordAudit(
            @RequestBody AuditLogCreateRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        if (request == null || request.getActionType() == null || request.getActionType().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        String userEmail = null;
        if (jwt != null) {
            userEmail = jwt.getClaimAsString("email");
            if (userEmail == null || userEmail.isBlank()) userEmail = jwt.getClaimAsString("preferred_username");
        }
        AuditLog audit = new AuditLog();
        audit.setTimestamp(Instant.now());
        audit.setUserId(userId);
        audit.setUserEmail(userEmail != null ? userEmail : (request.getUserEmail() != null ? request.getUserEmail() : "—"));
        audit.setActionType(request.getActionType().trim());
        audit.setEntityType(request.getEntityType() != null && !request.getEntityType().isBlank() ? request.getEntityType().trim() : "APPLICATION");
        audit.setEntityId(request.getEntityId() != null ? request.getEntityId().trim() : null);
        audit.setDescription(request.getDescription() != null && !request.getDescription().isBlank() ? request.getDescription().trim() : request.getActionType());
        auditLogRepository.save(audit);
        return ResponseEntity.noContent().build();
    }

    /** Request body for POST /audit. */
    public static class AuditLogCreateRequest {
        private String actionType;
        private String entityType;
        private String entityId;
        private String description;
        private String userEmail;

        public String getActionType() { return actionType; }
        public void setActionType(String actionType) { this.actionType = actionType; }
        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        public String getEntityId() { return entityId; }
        public void setEntityId(String entityId) { this.entityId = entityId; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    }

    private static UUID parseUserId(String sub) {
        if (sub == null || sub.isBlank()) return null;
        try {
            if (sub.length() == 32 && !sub.contains("-")) {
                return UUID.fromString(sub.replaceFirst("(\\w{8})(\\w{4})(\\w{4})(\\w{4})(\\w{12})", "$1-$2-$3-$4-$5"));
            }
            return UUID.fromString(sub);
        } catch (Exception e) {
            return null;
        }
    }

    private AuditLogDto toDto(AuditLog a) {
        AuditLogDto dto = new AuditLogDto();
        dto.setAuditId(a.getAuditId());
        dto.setTimestamp(a.getTimestamp());
        dto.setUserId(a.getUserId());
        dto.setUserEmail(a.getUserEmail());
        dto.setActionType(a.getActionType());
        dto.setEntityType(a.getEntityType());
        dto.setEntityId(a.getEntityId());
        dto.setDescription(a.getDescription());
        dto.setTraceId(a.getTraceId());
        return dto;
    }

    public static class AuditLogDto {
        private UUID auditId;
        private java.time.Instant timestamp;
        private UUID userId;
        private String userEmail;
        private String actionType;
        private String entityType;
        private String entityId;
        private String description;
        private String traceId;

        public UUID getAuditId() { return auditId; }
        public void setAuditId(UUID auditId) { this.auditId = auditId; }
        public java.time.Instant getTimestamp() { return timestamp; }
        public void setTimestamp(java.time.Instant timestamp) { this.timestamp = timestamp; }
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getActionType() { return actionType; }
        public void setActionType(String actionType) { this.actionType = actionType; }
        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        public String getEntityId() { return entityId; }
        public void setEntityId(String entityId) { this.entityId = entityId; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getTraceId() { return traceId; }
        public void setTraceId(String traceId) { this.traceId = traceId; }
    }
}
