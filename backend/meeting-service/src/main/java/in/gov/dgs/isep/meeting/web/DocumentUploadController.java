package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.service.AuditService;
import in.gov.dgs.isep.meeting.service.DocumentUploadService;
import in.gov.dgs.isep.meeting.util.SecurityUtils;
import in.gov.dgs.isep.shared.util.DeviceTypeUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/meetings/{meetingId}/agenda/{agendaItemId}/documents")
public class DocumentUploadController {

    private final DocumentUploadService uploadService;
    private final AuditService auditService;
    private final UserRepository userRepository;

    public DocumentUploadController(
            DocumentUploadService uploadService,
            AuditService auditService,
            UserRepository userRepository) {
        this.uploadService = uploadService;
        this.auditService = auditService;
        this.userRepository = userRepository;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentUploadResponse> upload(
            @PathVariable UUID meetingId,
            @PathVariable UUID agendaItemId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request,
            Authentication auth) {

        DocumentUploadResponse result = uploadService.upload(meetingId, agendaItemId, file, auth);

        String ua = request.getHeader("User-Agent");
        auditService.log(
                SecurityUtils.resolveInternalUserId(auth, userRepository),
                SecurityUtils.getRole(auth),
                "UPLOAD",
                "Document",
                result.documentId(),
                request.getRemoteAddr(),
                DeviceTypeUtil.detect(ua),
                ua,
                "SUCCESS",
                Map.of(
                        "fileName", result.fileName(),
                        "meetingId", meetingId.toString(),
                        "agendaItemId", agendaItemId.toString()
                )
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
}
