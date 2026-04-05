package in.gov.dgs.isep.meeting.config;

import in.gov.dgs.isep.meeting.service.TaskEscalationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TaskEscalationScheduler {

    private static final Logger log = LoggerFactory.getLogger(TaskEscalationScheduler.class);

    private final TaskEscalationService taskEscalationService;

    public TaskEscalationScheduler(TaskEscalationService taskEscalationService) {
        this.taskEscalationService = taskEscalationService;
    }

    /** Daily 08:00 UTC — overdue task escalation (A-D-03). */
    @Scheduled(cron = "0 0 8 * * *", zone = "UTC")
    public void runEscalation() {
        try {
            int n = taskEscalationService.escalateOverdue();
            log.info("Task escalation job completed: {} task(s) escalated", n);
        } catch (Exception e) {
            log.error("Task escalation job failed", e);
        }
    }
}
