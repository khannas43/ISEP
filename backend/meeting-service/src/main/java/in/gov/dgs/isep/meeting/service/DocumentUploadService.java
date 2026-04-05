package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.AgendaItem;
import in.gov.dgs.isep.meeting.domain.Document;
import in.gov.dgs.isep.meeting.domain.InternationalBody;
import in.gov.dgs.isep.meeting.domain.Meeting;
import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.repository.AgendaItemRepository;
import in.gov.dgs.isep.meeting.repository.DocumentRepository;
import in.gov.dgs.isep.meeting.repository.MeetingRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.util.SecurityUtils;
import in.gov.dgs.isep.meeting.web.DocumentUploadResponse;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.opensearch.client.json.JsonData;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class DocumentUploadService {

    private static final Logger log = LoggerFactory.getLogger(DocumentUploadService.class);
    private static final long MAX_BYTES = 100L * 1024 * 1024;
    private static final Set<String> ALLOWED_MIME = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/html"
    );

    private final DocumentRepository documentRepository;
    private final MeetingRepository meetingRepository;
    private final AgendaItemRepository agendaItemRepository;
    private final UserRepository userRepository;
    private final MinioClient minioClient;
    private final OpenSearchClient openSearchClient;

    @Value("${minio.bucket}")
    private String minioBucket;

    public DocumentUploadService(
            DocumentRepository documentRepository,
            MeetingRepository meetingRepository,
            AgendaItemRepository agendaItemRepository,
            UserRepository userRepository,
            MinioClient minioClient,
            OpenSearchClient openSearchClient) {
        this.documentRepository = documentRepository;
        this.meetingRepository = meetingRepository;
        this.agendaItemRepository = agendaItemRepository;
        this.userRepository = userRepository;
        this.minioClient = minioClient;
        this.openSearchClient = openSearchClient;
    }

    @Transactional
    public DocumentUploadResponse upload(UUID meetingId, UUID agendaItemId, MultipartFile file, Authentication auth) {
        UUID uploadedById = SecurityUtils.resolveInternalUserId(auth, userRepository);
        if (uploadedById == null) {
            throw new IllegalArgumentException("Unauthenticated");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        long size = file.getSize();
        if (size > MAX_BYTES) {
            throw new IllegalArgumentException("File exceeds maximum size of 100MB");
        }
        String mime = file.getContentType() != null ? file.getContentType().trim() : "";
        if (!ALLOWED_MIME.contains(mime)) {
            throw new IllegalArgumentException("Invalid file type. Allowed: PDF, DOCX, HTML");
        }

        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));
        AgendaItem agendaItem = agendaItemRepository.findByAgendaItemIdAndMeeting_MeetingId(agendaItemId, meetingId)
                .orElseThrow(() -> new RuntimeException("Agenda item not found for this meeting: " + agendaItemId));

        InternationalBody body = meeting.getBody();
        if (body == null) {
            throw new RuntimeException("Meeting has no committee body");
        }
        UUID committeeId = body.getBodyId();

        User uploader = userRepository.findById(uploadedById)
                .orElseGet(() -> userRepository.findByIsActiveTrue(PageRequest.of(0, 1)).getContent().stream()
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("User not found: " + uploadedById)));

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new IllegalArgumentException("Could not read file");
        }
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String sanitized = sanitizeFileName(originalName);
        String checksum = sha256Hex(bytes);

        UUID fileUuid = UUID.randomUUID();
        String objectKey = String.format("papers/%s/%s/%s/%s-%s",
                committeeId, meetingId, agendaItemId, fileUuid, sanitized);

        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(minioBucket)
                    .object(objectKey)
                    .stream(new ByteArrayInputStream(bytes), bytes.length, -1)
                    .contentType(mime)
                    .build());
        } catch (Exception e) {
            log.error("MinIO upload failed", e);
            throw new RuntimeException("Storage operation failed");
        }

        Document doc = new Document();
        doc.setMeeting(meeting);
        doc.setAgendaItem(agendaItem);
        doc.setBody(body);
        doc.setTitle(sanitized);
        doc.setDocumentType("COUNTRY_POSITION");
        doc.setSource("INDIA");
        doc.setMinioBucket(minioBucket);
        doc.setMinioObjectKey(objectKey);
        doc.setFileName(originalName);
        doc.setFileSizeBytes(size);
        doc.setMimeType(mime);
        doc.setChecksumSha256(checksum);
        doc.setCurrentVersion(1);
        doc.setStatus("DRAFT");
        doc.setIsDownloadable(true);
        doc.setUploadedBy(uploader);

        doc = documentRepository.save(doc);

        indexDocumentMetadata(doc, committeeId, meetingId, agendaItemId);

        return new DocumentUploadResponse(
                doc.getDocumentId(),
                doc.getFileName(),
                doc.getFileSizeBytes(),
                doc.getMimeType(),
                doc.getCurrentVersion(),
                doc.getStatus(),
                meetingId,
                agendaItemId,
                committeeId,
                doc.getUploadedAt()
        );
    }

    private void indexDocumentMetadata(Document doc, UUID committeeId, UUID meetingId, UUID agendaItemId) {
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("documentId", doc.getDocumentId().toString());
            payload.put("fileName", doc.getFileName());
            payload.put("meetingId", meetingId.toString());
            payload.put("agendaItemId", agendaItemId.toString());
            payload.put("committeeId", committeeId.toString());
            payload.put("mimeType", doc.getMimeType());
            payload.put("status", doc.getStatus());
            openSearchClient.index(i -> i
                    .index("documents_index")
                    .id(doc.getDocumentId().toString())
                    .document(JsonData.of(payload)));
        } catch (Exception e) {
            log.warn("OpenSearch indexing skipped: {}", e.getMessage());
        }
    }

    private static String sanitizeFileName(String name) {
        String base = name.replaceAll("[^a-zA-Z0-9._-]", "_");
        return base.isBlank() ? "file" : base;
    }

    private static String sha256Hex(byte[] bytes) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            return "0".repeat(64);
        }
    }
}
