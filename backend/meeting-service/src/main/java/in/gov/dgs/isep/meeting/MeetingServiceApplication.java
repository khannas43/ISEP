package in.gov.dgs.isep.meeting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * ISEP Meeting Service — main Spring Boot application.
 * Provides REST APIs for bodies, meetings, agenda items, documents, papers, feedback,
 * tasks, correspondence groups, notifications, reports, and live meeting (interventions/outcomes).
 * Configure: application.yml (datasource, JWT Keycloak, server.port 8081).
 */
@SpringBootApplication(scanBasePackages = "in.gov.dgs.isep")
@EnableScheduling
public class MeetingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeetingServiceApplication.class, args);
    }
}
