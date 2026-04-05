package in.gov.dgs.isep.meeting.domain;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "documents", schema = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "document_id")
    private UUID documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agenda_item_id")
    private AgendaItem agendaItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "body_id")
    private InternationalBody body;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @Column(nullable = false, length = 1000)
    private String title;

    @Column(nullable = false, length = 50)
    private String source;

    @Column(name = "minio_bucket", nullable = false, length = 255)
    private String minioBucket;

    @Column(name = "minio_object_key", nullable = false, length = 1000)
    private String minioObjectKey;

    @Column(name = "file_name", nullable = false, length = 500)
    private String fileName;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "checksum_sha256", nullable = false, length = 64)
    private String checksumSha256;

    @Column(name = "current_version", nullable = false)
    private Integer currentVersion = 1;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "is_downloadable", nullable = false)
    private Boolean isDownloadable = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "is_locked", nullable = false)
    private Boolean isLocked = false;

    @Column(name = "content_html", columnDefinition = "TEXT")
    private String contentHtml;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_json", columnDefinition = "jsonb")
    private JsonNode contentJson;

    @Column(name = "ydoc_state")
    private byte[] ydocState;

    public Document() {}

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (uploadedAt == null) uploadedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getDocumentId() { return documentId; }
    public void setDocumentId(UUID documentId) { this.documentId = documentId; }
    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }
    public AgendaItem getAgendaItem() { return agendaItem; }
    public void setAgendaItem(AgendaItem agendaItem) { this.agendaItem = agendaItem; }
    public InternationalBody getBody() { return body; }
    public void setBody(InternationalBody body) { this.body = body; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getMinioBucket() { return minioBucket; }
    public void setMinioBucket(String minioBucket) { this.minioBucket = minioBucket; }
    public String getMinioObjectKey() { return minioObjectKey; }
    public void setMinioObjectKey(String minioObjectKey) { this.minioObjectKey = minioObjectKey; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    public String getChecksumSha256() { return checksumSha256; }
    public void setChecksumSha256(String checksumSha256) { this.checksumSha256 = checksumSha256; }
    public Integer getCurrentVersion() { return currentVersion; }
    public void setCurrentVersion(Integer currentVersion) { this.currentVersion = currentVersion; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Boolean getIsDownloadable() { return isDownloadable; }
    public void setIsDownloadable(Boolean downloadable) { isDownloadable = downloadable; }
    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }
    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean locked) { isLocked = locked; }
    public String getContentHtml() { return contentHtml; }
    public void setContentHtml(String contentHtml) { this.contentHtml = contentHtml; }
    public JsonNode getContentJson() { return contentJson; }
    public void setContentJson(JsonNode contentJson) { this.contentJson = contentJson; }
    public byte[] getYdocState() { return ydocState; }
    public void setYdocState(byte[] ydocState) { this.ydocState = ydocState; }
}
