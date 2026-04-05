package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.service.TaskEscalationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Admin-only job triggers under /api/v1/system/jobs (same security as /api/v1/system/**).
 */
@RestController
@RequestMapping("/api/v1/system/jobs")
public class SystemJobController {

    private final TaskEscalationService taskEscalationService;

    public SystemJobController(TaskEscalationService taskEscalationService) {
        this.taskEscalationService = taskEscalationService;
    }

    @PostMapping("/escalate-tasks")
    public ResponseEntity<Map<String, Object>> escalateTasks() {
        int escalated = taskEscalationService.escalateOverdue();
        return ResponseEntity.ok(Map.of("escalated", escalated));
    }
}
