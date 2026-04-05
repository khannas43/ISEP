package in.gov.dgs.isep.meeting.service;

import com.fasterxml.jackson.databind.JsonNode;
import in.gov.dgs.isep.meeting.domain.Document;
import in.gov.dgs.isep.meeting.domain.DocumentVersion;
import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.repository.DocumentRepository;
import in.gov.dgs.isep.meeting.repository.DocumentVersionRepository;
import in.gov.dgs.isep.meeting.repository.MeetingParticipantRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.web.EditorLoadResponse;
import in.gov.dgs.isep.meeting.web.EditorVersionDetailDto;
import in.gov.dgs.isep.meeting.web.EditorVersionSummaryDto;
import in.gov.dgs.isep.meeting.web.SaveDocumentContentRequest;
import in.gov.dgs.isep.meeting.web.SaveDocumentContentResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentEditorService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final MeetingParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public DocumentEditorService(
            DocumentRepository documentRepository,
            DocumentVersionRepository documentVersionRepository,
            MeetingParticipantRepository participantRepository,
            UserRepository userRepository,
            AuditService auditService) {
        this.documentRepository = documentRepository;
        this.documentVersionRepository = documentVersionRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public EditorLoadResponse getEditor(UUID documentId, UUID userId, boolean systemAdmin) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        assertCanAccess(doc, userId, systemAdmin);
        boolean locked = Boolean.TRUE.equals(doc.getIsLocked());
        int ver = doc.getCurrentVersion() != null ? doc.getCurrentVersion() : 1;
        String ydocB64 = doc.getYdocState() != null && doc.getYdocState().length > 0
                ? Base64.getEncoder().encodeToString(doc.getYdocState())
                : null;
        return new EditorLoadResponse(
                doc.getDocumentId(),
                doc.getTitle(),
                doc.getContentHtml(),
                doc.getContentJson(),
                ydocB64,
                ver,
                doc.getStatus(),
                locked,
                !locked
        );
    }

    @Transactional
    public SaveDocumentContentResponse saveContent(
            UUID documentId,
            SaveDocumentContentRequest req,
            UUID userId,
            boolean systemAdmin
    ) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        if (Boolean.TRUE.equals(doc.getIsLocked())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Document is locked");
        }
        assertCanAccess(doc, userId, systemAdmin);

        int current = doc.getCurrentVersion() != null ? doc.getCurrentVersion() : 1;
        if (req.getVersion() == null || req.getVersion() != current) {
            throw new VersionConflictException(current);
        }

        User saver = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));

        String html = req.getContentHtml() != null ? req.getContentHtml() : "";
        byte[] ydoc = null;
        if (req.getYdocState() != null && !req.getYdocState().isBlank()) {
            try {
                ydoc = Base64.getDecoder().decode(req.getYdocState());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid ydocState base64");
            }
        }

        doc.setContentHtml(html);
        doc.setContentJson(req.getContentJson());
        doc.setYdocState(ydoc);

        int nextVer = current + 1;
        doc.setCurrentVersion(nextVer);
        doc = documentRepository.save(doc);

        String checksum = sha256Hex(html.getBytes(StandardCharsets.UTF_8));
        DocumentVersion snap = new DocumentVersion();
        snap.setDocument(doc);
        snap.setVersionNumber(nextVer);
        snap.setContentHtml(html);
        snap.setContentJson(req.getContentJson());
        snap.setYdocState(ydoc);
        snap.setMinioObjectKey("editor/snapshot/" + documentId + "/v" + nextVer);
        snap.setUploadedBy(saver);
        snap.setUploadedAt(Instant.now());
        snap.setChangeSummary("Editor save");
        snap.setFileSizeBytes((long) html.getBytes(StandardCharsets.UTF_8).length);
        snap.setChecksumSha256(checksum);
        documentVersionRepository.save(snap);

        try {
            auditService.log(
                    userId,
                    null,
                    "EDIT",
                    "Document",
                    documentId,
                    null,
                    null,
                    null,
                    "SUCCESS",
                    Map.of("version", nextVer)
            );
        } catch (Exception ignored) {
            // non-fatal
        }

        return new SaveDocumentContentResponse(nextVer, Instant.now());
    }

    @Transactional(readOnly = true)
    public List<EditorVersionSummaryDto> listVersionSummaries(UUID documentId, UUID userId, boolean systemAdmin) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        assertCanAccess(doc, userId, systemAdmin);
        return documentVersionRepository.findByDocumentDocumentIdOrderByVersionNumberDesc(documentId).stream()
                .map(v -> new EditorVersionSummaryDto(
                        v.getVersionId(),
                        v.getVersionNumber() != null ? v.getVersionNumber() : 0,
                        new EditorVersionSummaryDto.EditorUserRef(
                                v.getUploadedBy() != null ? v.getUploadedBy().getUserId() : null,
                                v.getUploadedBy() != null ? v.getUploadedBy().getFullName() : null
                        ),
                        v.getUploadedAt(),
                        v.getChangeSummary()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EditorVersionDetailDto getVersionDetail(UUID documentId, UUID versionId, UUID userId, boolean systemAdmin) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        assertCanAccess(doc, userId, systemAdmin);
        DocumentVersion v = documentVersionRepository.findById(versionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found"));
        if (v.getDocument() == null || !v.getDocument().getDocumentId().equals(documentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found");
        }
        return new EditorVersionDetailDto(
                v.getVersionId(),
                v.getVersionNumber() != null ? v.getVersionNumber() : 0,
                v.getContentHtml(),
                v.getContentJson(),
                new EditorVersionSummaryDto.EditorUserRef(
                        v.getUploadedBy() != null ? v.getUploadedBy().getUserId() : null,
                        v.getUploadedBy() != null ? v.getUploadedBy().getFullName() : null
                ),
                v.getUploadedAt()
        );
    }

    private void assertCanAccess(Document doc, UUID userId, boolean systemAdmin) {
        if (systemAdmin) {
            return;
        }
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        if (doc.getMeeting() == null) {
            if (doc.getUploadedBy() != null && userId.equals(doc.getUploadedBy().getUserId())) {
                return;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to edit this document");
        }
        UUID meetingId = doc.getMeeting().getMeetingId();
        if (participantRepository.existsByMeetingMeetingIdAndUserUserId(meetingId, userId)) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a meeting participant");
    }

    private static String sha256Hex(byte[] bytes) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            return "0".repeat(64);
        }
    }

    /** Thrown when client version does not match server currentVersion. */
    public static class VersionConflictException extends RuntimeException {
        private final int currentVersion;

        public VersionConflictException(int currentVersion) {
            super("VERSION_CONFLICT");
            this.currentVersion = currentVersion;
        }

        public int getCurrentVersion() {
            return currentVersion;
        }
    }
}
