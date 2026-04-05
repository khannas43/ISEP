package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.repository.DocumentRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.service.DocumentDiffService;
import in.gov.dgs.isep.meeting.service.DocumentEditorService;
import in.gov.dgs.isep.meeting.service.DocumentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for document management (SCR-DOC).
 * Base path: /api/v1/documents
 * List (optional meetingId, q), get, download (current or specific version), get version text (for diff),
 * list versions, upload new version. Version 1 may be served from main document file when no version row exists.
 */
@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentRepository documentRepository;
    private final DocumentEditorService documentEditorService;
    private final DocumentDiffService documentDiffService;
    private final UserRepository userRepository;

    public DocumentController(
            DocumentService documentService,
            DocumentRepository documentRepository,
            DocumentEditorService documentEditorService,
            DocumentDiffService documentDiffService,
            UserRepository userRepository) {
        this.documentService = documentService;
        this.documentRepository = documentRepository;
        this.documentEditorService = documentEditorService;
        this.documentDiffService = documentDiffService;
        this.userRepository = userRepository;
    }

    private static boolean isSystemAdmin(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        for (GrantedAuthority a : authentication.getAuthorities()) {
            if ("ROLE_SYSTEM_ADMIN".equals(a.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    /** Matches HTTP security for POST .../clean-copy (SA / IC head / delegation leader). */
    private static boolean canBypassParticipantForCleanCopy(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        for (GrantedAuthority a : authentication.getAuthorities()) {
            String auth = a.getAuthority();
            if ("ROLE_SYSTEM_ADMIN".equals(auth)
                    || "ROLE_IC_DIVISION_HEAD".equals(auth)
                    || "ROLE_DELEGATION_LEADER".equals(auth)) {
                return true;
            }
        }
        return false;
    }

    private UUID internalUserIdFromJwt(Jwt jwt) {
        if (jwt == null) {
            return null;
        }
        return userRepository
                .resolveJwtSubjectToUserId(jwt.getSubject(), jwt.getClaimAsString("preferred_username"))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<Page<DocumentDto>> list(
            @RequestParam(required = false) UUID meetingId,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        if (q != null && !q.isBlank() && meetingId == null) {
            return ResponseEntity.ok(documentRepository.searchByTitleOrFileName(q.trim(), pageable).map(DocumentDto::from));
        }
        if (meetingId != null) {
            return ResponseEntity.ok(documentRepository.findByMeetingMeetingIdOrderByUploadedAtDesc(meetingId, pageable)
                    .map(DocumentDto::from));
        }
        return ResponseEntity.ok(documentRepository.findAllByOrderByUploadedAtDesc(pageable).map(DocumentDto::from));
    }

    /** TASK-S2-02 — HTML diff between two saved versions (word-level). */
    @Transactional(readOnly = true)
    @GetMapping("/{id}/diff")
    public ResponseEntity<DiffResponse> getDiff(
            @PathVariable UUID id,
            @RequestParam int fromVersion,
            @RequestParam int toVersion,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication
    ) {
        UUID uid = internalUserIdFromJwt(jwt);
        if (uid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(documentDiffService.getDiff(id, fromVersion, toVersion, uid, isSystemAdmin(authentication)));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return ResponseEntity.notFound().build();
            }
            if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                return ResponseEntity.badRequest().build();
            }
            throw e;
        }
    }

    @PostMapping("/{id}/diff/decisions")
    public ResponseEntity<DecisionRecordDto> recordDiffDecision(
            @PathVariable UUID id,
            @Valid @RequestBody DiffDecisionRequest body,
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest httpRequest
    ) {
        UUID uid = internalUserIdFromJwt(jwt);
        if (uid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(documentDiffService.recordDecision(id, body, uid, httpRequest));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return ResponseEntity.notFound().build();
            }
            if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                return ResponseEntity.badRequest().build();
            }
            throw e;
        }
    }

    @PostMapping("/{id}/clean-copy")
    public ResponseEntity<CleanCopyResponse> generateCleanCopy(
            @PathVariable UUID id,
            @Valid @RequestBody CleanCopyRequest body,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        if (jwt == null || jwt.getSubject() == null || jwt.getSubject().isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(documentDiffService.generateCleanCopy(
                    id,
                    body,
                    jwt.getSubject(),
                    jwt.getClaimAsString("preferred_username"),
                    canBypassParticipantForCleanCopy(authentication),
                    httpRequest));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return ResponseEntity.notFound().build();
            }
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                return ResponseEntity.badRequest().build();
            }
            throw e;
        }
    }

    /** TipTap collaborative editor — load document body + version (TASK-S2-01 Layer 1). */
    @Transactional(readOnly = true)
    @GetMapping("/{id}/editor")
    public ResponseEntity<EditorLoadResponse> getForEditor(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication
    ) {
        UUID uid = internalUserIdFromJwt(jwt);
        if (uid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(documentEditorService.getEditor(id, uid, isSystemAdmin(authentication)));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return ResponseEntity.notFound().build();
            }
            if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            throw e;
        }
    }

    /** Auto-save editor content (optimistic concurrency on version). */
    @PutMapping("/{id}/content")
    public ResponseEntity<?> saveEditorContent(
            @PathVariable UUID id,
            @Valid @RequestBody SaveDocumentContentRequest body,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication
    ) {
        UUID uid = internalUserIdFromJwt(jwt);
        if (uid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(documentEditorService.saveContent(id, body, uid, isSystemAdmin(authentication)));
        } catch (DocumentEditorService.VersionConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "VERSION_CONFLICT",
                    "currentVersion", e.getCurrentVersion()
            ));
        }
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> get(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(documentService.getDocument(id));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    /** Stream download of current version (SCR-DOC-01–06). */
    @Transactional(readOnly = true)
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable UUID id) {
        try {
            DocumentDto doc = documentService.getDocument(id);
            Resource resource = documentService.getDocumentResource(id);
            String filename = doc.getFileName() != null ? doc.getFileName() : "document";
            String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + encoded)
                    .body(resource);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /** Download a specific version (for compare). */
    @Transactional(readOnly = true)
    @GetMapping("/{id}/versions/{versionNumber}/download")
    public ResponseEntity<Resource> downloadVersion(@PathVariable UUID id, @PathVariable int versionNumber) {
        try {
            List<DocumentVersionDto> versions = documentService.listVersions(id);
            DocumentVersionDto ver = versions.stream().filter(v -> v.getVersionNumber() != null && v.getVersionNumber() == versionNumber).findFirst().orElse(null);
            // Allow version 1 when no row exists (initial upload); service resolves via main document file.
            if (ver == null && versionNumber != 1) return ResponseEntity.notFound().build();
            Resource resource = documentService.getDocumentVersionResource(id, versionNumber);
            DocumentDto doc = documentService.getDocument(id);
            String filename = (doc.getFileName() != null ? doc.getFileName() : "document").replaceFirst("(\\.?[^.]+)$", "_v" + versionNumber + "$1");
            String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + encoded)
                    .body(resource);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) return ResponseEntity.notFound().build();
            throw e;
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /** Plain text of a version for diff comparison (PDF and DOCX supported). */
    @Transactional(readOnly = true)
    @GetMapping(value = "/{id}/versions/{versionNumber}/text", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getVersionText(@PathVariable UUID id, @PathVariable int versionNumber) {
        try {
            String text = documentService.getDocumentVersionText(id, versionNumber);
            return ResponseEntity.ok(text != null ? text : "");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to extract text.");
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    /** Specific version snapshot by row id (editor / TipTap history). */
    @Transactional(readOnly = true)
    @GetMapping("/{id}/versions/{versionId}")
    public ResponseEntity<EditorVersionDetailDto> getVersionSnapshot(
            @PathVariable UUID id,
            @PathVariable UUID versionId,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication
    ) {
        UUID uid = internalUserIdFromJwt(jwt);
        if (uid == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(documentEditorService.getVersionDetail(id, versionId, uid, isSystemAdmin(authentication)));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return ResponseEntity.notFound().build();
            }
            if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            throw e;
        }
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/versions")
    public ResponseEntity<?> listVersions(
            @PathVariable UUID id,
            @RequestParam(required = false) String view,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication
    ) {
        try {
            if ("editor".equals(view)) {
                UUID uid = internalUserIdFromJwt(jwt);
                if (uid == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
                return ResponseEntity.ok(documentEditorService.listVersionSummaries(id, uid, isSystemAdmin(authentication)));
            }
            return ResponseEntity.ok(documentService.listVersions(id));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return ResponseEntity.notFound().build();
            }
            if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            throw e;
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @PostMapping("/{id}/versions")
    public ResponseEntity<DocumentDto> uploadNewVersion(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String changeSummary,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID uploadedBy = internalUserIdFromJwt(jwt);
        if (uploadedBy == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(documentService.addNewVersion(id, file, changeSummary, uploadedBy));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }
}
