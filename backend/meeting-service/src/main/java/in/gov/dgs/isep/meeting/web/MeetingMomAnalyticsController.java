package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.repository.TaskRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.service.AnalyticsExportService;
import in.gov.dgs.isep.meeting.service.AnalyticsService;
import in.gov.dgs.isep.meeting.service.MinutesOfMeetingService;
import in.gov.dgs.isep.meeting.service.PdfExportService;
import in.gov.dgs.isep.meeting.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meetings")
public class MeetingMomAnalyticsController {

    private final MinutesOfMeetingService minutesOfMeetingService;
    private final PdfExportService pdfExportService;
    private final AnalyticsService analyticsService;
    private final AnalyticsExportService analyticsExportService;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public MeetingMomAnalyticsController(
            MinutesOfMeetingService minutesOfMeetingService,
            PdfExportService pdfExportService,
            AnalyticsService analyticsService,
            AnalyticsExportService analyticsExportService,
            TaskRepository taskRepository,
            UserRepository userRepository) {
        this.minutesOfMeetingService = minutesOfMeetingService;
        this.pdfExportService = pdfExportService;
        this.analyticsService = analyticsService;
        this.analyticsExportService = analyticsExportService;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/{meetingId}/mom/generate")
    public ResponseEntity<MinutesOfMeetingDto> generateMom(
            @PathVariable UUID meetingId,
            HttpServletRequest request,
            Authentication auth) {
        UUID userId = SecurityUtils.resolveInternalUserId(auth, userRepository);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            MinutesOfMeetingDto dto = minutesOfMeetingService.generate(
                    meetingId, userId, request, SecurityUtils.getRole(auth));
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @Transactional(readOnly = true)
    @GetMapping("/{meetingId}/mom")
    public ResponseEntity<MinutesOfMeetingDto> getMom(@PathVariable UUID meetingId) {
        return minutesOfMeetingService.getByMeetingId(meetingId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional(readOnly = true)
    @GetMapping("/{meetingId}/mom/export")
    public ResponseEntity<byte[]> exportMomPdf(@PathVariable UUID meetingId) {
        try {
            var mom = minutesOfMeetingService.requireForExport(meetingId);
            byte[] pdf = pdfExportService.htmlToPdf(mom.getContentHtml());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"MoM-" + meetingId + ".pdf\"")
                    .body(pdf);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @Transactional(readOnly = true)
    @GetMapping("/{meetingId}/analytics")
    public ResponseEntity<AnalyticsDto> getAnalytics(@PathVariable UUID meetingId) {
        try {
            return ResponseEntity.ok(analyticsService.getAnalytics(meetingId));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @Transactional(readOnly = true)
    @GetMapping("/{meetingId}/analytics/export")
    public ResponseEntity<byte[]> exportAnalytics(
            @PathVariable UUID meetingId,
            @RequestParam(defaultValue = "xlsx") String format) {
        try {
            AnalyticsDto analytics = analyticsService.getAnalytics(meetingId);
            var tasks = taskRepository.findByMeetingMeetingIdOrderByDueDateAsc(meetingId);
            String f = format != null ? format.toLowerCase() : "xlsx";
            if ("xml".equals(f)) {
                byte[] body = analyticsExportService.analyticsToXml(analytics);
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_XML_VALUE)
                        .header(
                                HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"analytics-" + meetingId + ".xml\"")
                        .body(body);
            }
            if ("xlsx".equals(f)) {
                byte[] body = analyticsExportService.analyticsToExcel(analytics, tasks);
                return ResponseEntity.ok()
                        .header(
                                HttpHeaders.CONTENT_TYPE,
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                        .header(
                                HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"analytics-" + meetingId + ".xlsx\"")
                        .body(body);
            }
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }
}
