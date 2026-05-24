package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.service.TaskApiService;
import in.gov.dgs.isep.meeting.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskApiController {

    private final TaskApiService taskApiService;
    private final UserRepository userRepository;

    public TaskApiController(TaskApiService taskApiService, UserRepository userRepository) {
        this.taskApiService = taskApiService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @Valid @RequestBody CreateTaskApiRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String sub = jwt != null ? jwt.getSubject() : null;
        String preferred = jwt != null ? jwt.getClaimAsString("preferred_username") : null;
        TaskResponse body = taskApiService.create(request, sub, preferred);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/my")
    public ResponseEntity<?> listMy(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID meetingId,
            @RequestParam(required = false) Boolean countOnly,
            @RequestParam(required = false) Boolean summary,
            Authentication authentication
    ) {
        UUID userId = SecurityUtils.resolveInternalUserId(authentication, userRepository);
        Object body = taskApiService.listMy(userId, status, meetingId, countOnly, summary);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/team/export")
    public ResponseEntity<Resource> exportTeam(
            @RequestParam(required = false) UUID meetingId,
            @RequestParam(defaultValue = "xlsx") String format,
            Authentication authentication
    ) {
        UUID userId = SecurityUtils.resolveInternalUserId(authentication, userRepository);
        byte[] bytes = taskApiService.exportTeam(userId, meetingId, format, authentication);
        String filename = "tasks." + ("xml".equalsIgnoreCase(format) ? "xml" : "xlsx");
        MediaType mt = "xml".equalsIgnoreCase(format)
                ? MediaType.APPLICATION_XML
                : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        ByteArrayResource resource = new ByteArrayResource(bytes);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mt)
                .contentLength(bytes.length)
                .body(resource);
    }

    @GetMapping("/team")
    public ResponseEntity<java.util.List<TaskResponse>> listTeam(
            @RequestParam(required = false) UUID meetingId,
            Authentication authentication
    ) {
        UUID userId = SecurityUtils.resolveInternalUserId(authentication, userRepository);
        return ResponseEntity.ok(taskApiService.listTeam(userId, meetingId, authentication));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> get(
            @PathVariable UUID taskId,
            Authentication authentication
    ) {
        UUID userId = SecurityUtils.resolveInternalUserId(authentication, userRepository);
        return ResponseEntity.ok(taskApiService.getTask(taskId, userId, authentication));
    }
}
