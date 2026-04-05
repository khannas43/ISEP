package in.gov.dgs.isep.meeting.service;

/**
 * Document CRUD, versioning, file storage, and text extraction.
 * Resolves version 1 from main document file when no document_versions row exists; on adding v2, persists v1 row.
 * Uses app.documents.upload-dir (default ./uploads/documents) or MinIO for file storage.
 */
import in.gov.dgs.isep.meeting.domain.Document;
import in.gov.dgs.isep.meeting.domain.DocumentVersion;
import in.gov.dgs.isep.meeting.domain.Meeting;
import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.repository.DocumentRepository;
import in.gov.dgs.isep.meeting.repository.DocumentVersionRepository;
import in.gov.dgs.isep.meeting.repository.MeetingRepository;
import in.gov.dgs.isep.meeting.repository.AgendaItemRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.web.DocumentDto;
import in.gov.dgs.isep.meeting.web.DocumentVersionDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final MeetingRepository meetingRepository;
    private final AgendaItemRepository agendaItemRepository;
    private final UserRepository userRepository;

    @Value("${app.documents.upload-dir:./uploads/documents}")
    private String uploadDir;

    public DocumentService(DocumentRepository documentRepository,
                          DocumentVersionRepository documentVersionRepository,
                          MeetingRepository meetingRepository,
                          AgendaItemRepository agendaItemRepository,
                          UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.documentVersionRepository = documentVersionRepository;
        this.meetingRepository = meetingRepository;
        this.agendaItemRepository = agendaItemRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public DocumentDto getDocument(UUID documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));
        return DocumentDto.from(doc);
    }

    @Transactional
    public DocumentDto createDocument(UUID meetingId, String title, String documentType, String source,
                                     UUID agendaItemId, UUID uploadedByUserId, MultipartFile file) throws IOException {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));
        User uploader = userRepository.findById(uploadedByUserId)
                .orElseGet(() -> {
                    var first = userRepository.findByIsActiveTrue(PageRequest.of(0, 1)).getContent();
                    if (first.isEmpty()) {
                        throw new RuntimeException("User not found: " + uploadedByUserId + ". No users in database; run user/seed data first.");
                    }
                    return first.get(0);
                });

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        byte[] bytes = file.getBytes();
        long size = bytes.length;
        String mimeType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        String checksum = sha256Hex(bytes);

        Document doc = new Document();
        doc.setMeeting(meeting);
        if (agendaItemId != null && agendaItemRepository.existsById(agendaItemId)) {
            doc.setAgendaItem(agendaItemRepository.getReferenceById(agendaItemId));
        }
        doc.setTitle(title != null && !title.isBlank() ? title.trim() : originalFilename);
        doc.setDocumentType(documentType != null && !documentType.isBlank() ? documentType : "OTHER");
        doc.setSource(source != null && !source.isBlank() ? source : "INDIA");
        doc.setFileName(originalFilename);
        doc.setFileSizeBytes(size);
        doc.setMimeType(mimeType);
        doc.setChecksumSha256(checksum);
        doc.setUploadedBy(uploader);
        doc.setMinioBucket("local");
        doc.setCurrentVersion(1);
        doc.setStatus("ACTIVE");
        doc.setIsDownloadable(true);
        // DB requires non-null minio_object_key; set placeholder until we have documentId
        doc.setMinioObjectKey("documents/temp/" + sanitizeFileName(originalFilename));

        doc = documentRepository.save(doc);

        String objectKey = "documents/" + doc.getDocumentId() + "/" + sanitizeFileName(originalFilename);
        doc.setMinioObjectKey(objectKey);
        documentRepository.save(doc);

        Path dir = Path.of(uploadDir).resolve(doc.getDocumentId().toString());
        Files.createDirectories(dir);
        Files.write(dir.resolve(sanitizeFileName(originalFilename)), bytes);

        return DocumentDto.from(doc);
    }

    private static String sha256Hex(byte[] bytes) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(bytes);
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            return "0".repeat(64);
        }
    }

    private static String sanitizeFileName(String name) {
        if (name == null) return "file";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    /** Resolve local file path for a document (current version). */
    @Transactional(readOnly = true)
    public Path getDocumentFilePath(UUID documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));
        String objectKey = doc.getMinioObjectKey();
        String fileName = objectKey != null && objectKey.contains("/")
                ? objectKey.substring(objectKey.lastIndexOf('/') + 1)
                : doc.getFileName();
        return Path.of(uploadDir).resolve(doc.getDocumentId().toString()).resolve(sanitizeFileName(fileName));
    }

    /** Resolve local file path for a specific document version. Version 1 uses main document path when no version row exists. */
    @Transactional(readOnly = true)
    public Path getDocumentVersionFilePath(UUID documentId, int versionNumber) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));
        int current = doc.getCurrentVersion() != null ? doc.getCurrentVersion() : 1;
        if (versionNumber == current) {
            return getDocumentFilePath(documentId);
        }
        List<DocumentVersion> versions = documentVersionRepository.findByDocumentDocumentIdOrderByVersionNumberDesc(documentId);
        // Version 1 with no row: use main document file (e.g. existing docs before we persisted v1 on add v2).
        if (versionNumber == 1) {
            boolean hasV1 = versions.stream().anyMatch(v -> v.getVersionNumber() != null && v.getVersionNumber() == 1);
            if (!hasV1) {
                return getDocumentFilePath(documentId);
            }
        }
        DocumentVersion version = versions.stream()
                .filter(v -> v.getVersionNumber() != null && v.getVersionNumber() == versionNumber)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Version not found: " + documentId + " v" + versionNumber));
        String objectKey = version.getMinioObjectKey();
        String fileName = objectKey != null && objectKey.contains("/")
                ? objectKey.substring(objectKey.lastIndexOf('/') + 1)
                : "v" + versionNumber;
        return Path.of(uploadDir).resolve(doc.getDocumentId().toString()).resolve(sanitizeFileName(fileName));
    }

    /** Return resource for streaming download (current version). */
    @Transactional(readOnly = true)
    public Resource getDocumentResource(UUID documentId) throws IOException {
        Path path = getDocumentFilePath(documentId);
        if (!Files.exists(path) || !Files.isRegularFile(path)) {
            throw new RuntimeException("Document file not found: " + documentId);
        }
        return new UrlResource(path.toUri());
    }

    /** Return resource for streaming download of a specific version. */
    @Transactional(readOnly = true)
    public Resource getDocumentVersionResource(UUID documentId, int versionNumber) throws IOException {
        Path path = getDocumentVersionFilePath(documentId, versionNumber);
        if (!Files.exists(path) || !Files.isRegularFile(path)) {
            throw new RuntimeException("Document version file not found: " + documentId + " v" + versionNumber);
        }
        return new UrlResource(path.toUri());
    }

    /** Extract plain text from a document version for comparison. Supports PDF and DOCX. */
    @Transactional(readOnly = true)
    public String getDocumentVersionText(UUID documentId, int versionNumber) throws IOException {
        Path path = getDocumentVersionFilePath(documentId, versionNumber);
        if (!Files.exists(path) || !Files.isRegularFile(path)) {
            throw new RuntimeException("Document version file not found: " + documentId + " v" + versionNumber);
        }
        String text = DocumentTextExtractor.extractText(path);
        return text != null ? text : "";
    }

    @Transactional(readOnly = true)
    public List<DocumentVersionDto> listVersions(UUID documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));
        return documentVersionRepository.findByDocumentDocumentIdOrderByVersionNumberDesc(documentId)
                .stream()
                .map(DocumentVersionDto::from)
                .collect(Collectors.toList());
    }

    /** Upload a new version of an existing document. */
    @Transactional
    public DocumentDto addNewVersion(UUID documentId, MultipartFile file, String changeSummary, UUID uploadedByUserId) throws IOException {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));
        User uploader = userRepository.findById(uploadedByUserId)
                .orElseGet(() -> {
                    var first = userRepository.findByIsActiveTrue(PageRequest.of(0, 1)).getContent();
                    if (first.isEmpty()) {
                        throw new RuntimeException("User not found: " + uploadedByUserId + ". No users in database; run user/seed data first.");
                    }
                    return first.get(0);
                });

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        byte[] bytes = file.getBytes();
        long size = bytes.length;
        String checksum = sha256Hex(bytes);
        int currentVer = doc.getCurrentVersion() != null ? doc.getCurrentVersion() : 1;
        int newVersion = currentVer + 1;
        String versionedFileName = "version_" + newVersion + "_" + sanitizeFileName(originalFilename);
        String objectKey = "documents/" + doc.getDocumentId() + "/" + versionedFileName;

        // Persist version 1 in document_versions when adding v2, so compare/diff can resolve v1 later.
        if (currentVer == 1) {
            DocumentVersion v1 = new DocumentVersion();
            v1.setDocument(doc);
            v1.setVersionNumber(1);
            v1.setMinioObjectKey(doc.getMinioObjectKey());
            v1.setUploadedBy(doc.getUploadedBy());
            v1.setUploadedAt(doc.getUploadedAt() != null ? doc.getUploadedAt() : doc.getCreatedAt());
            v1.setChangeSummary(null);
            v1.setFileSizeBytes(doc.getFileSizeBytes());
            v1.setChecksumSha256(doc.getChecksumSha256());
            documentVersionRepository.save(v1);
        }

        DocumentVersion version = new DocumentVersion();
        version.setDocument(doc);
        version.setVersionNumber(newVersion);
        version.setMinioObjectKey(objectKey);
        version.setUploadedBy(uploader);
        version.setUploadedAt(java.time.Instant.now());
        version.setChangeSummary(changeSummary != null && !changeSummary.isBlank() ? changeSummary.trim() : null);
        version.setFileSizeBytes(size);
        version.setChecksumSha256(checksum);
        documentVersionRepository.save(version);

        Path dir = Path.of(uploadDir).resolve(doc.getDocumentId().toString());
        Files.createDirectories(dir);
        Files.write(dir.resolve(versionedFileName), bytes);

        doc.setCurrentVersion(newVersion);
        doc.setMinioObjectKey(objectKey);
        doc.setFileSizeBytes(size);
        doc.setChecksumSha256(checksum);
        doc.setFileName(originalFilename);
        doc.setUploadedBy(uploader);
        doc.setUploadedAt(version.getUploadedAt());
        if (file.getContentType() != null) {
            doc.setMimeType(file.getContentType());
        }
        documentRepository.save(doc);

        return DocumentDto.from(doc);
    }
}
