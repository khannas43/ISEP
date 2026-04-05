package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.service.DashboardService;
import in.gov.dgs.isep.meeting.web.dashboard.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * ISEP Executive Dashboard API (ISEP-DASH-CURSOR-01).
 * All endpoints require Bearer JWT. Backend scopes pending actions to current user.
 */
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Transactional(readOnly = true)
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary(
            @RequestParam UUID meetingId,
            @RequestParam(required = false) String role,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        DashboardSummaryDto dto = dashboardService.getSummary(meetingId, role != null ? role : "MEMBER", userId);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @Transactional(readOnly = true)
    @GetMapping("/agenda-readiness")
    public ResponseEntity<List<AgendaReadinessDto>> getAgendaReadiness(@RequestParam UUID meetingId) {
        return ResponseEntity.ok(dashboardService.getAgendaReadiness(meetingId));
    }

    @Transactional(readOnly = true)
    @GetMapping("/paper-pipeline")
    public ResponseEntity<List<PaperPipelineDto>> getPaperPipeline(@RequestParam UUID meetingId) {
        return ResponseEntity.ok(dashboardService.getPaperPipeline(meetingId));
    }

    @Transactional(readOnly = true)
    @GetMapping("/pending-actions")
    public ResponseEntity<List<PendingActionDto>> getPendingActions(
            @RequestParam(required = false) String role,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        if (userId == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(dashboardService.getPendingActions(userId, role != null ? role : "MEMBER"));
    }

    @Transactional(readOnly = true)
    @GetMapping("/delegation-activity")
    public ResponseEntity<List<DelegationActivityDto>> getDelegationActivity(
            @RequestParam UUID meetingId,
            @AuthenticationPrincipal Jwt jwt) {
        String role = jwt != null && jwt.getClaim("realm_access") != null ? "COORDINATOR" : "COORDINATOR";
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        return ResponseEntity.ok(dashboardService.getDelegationActivity(meetingId, role, userId));
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
}
