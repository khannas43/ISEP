package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.DocumentVersion;

import java.time.Instant;
import java.util.UUID;

public class DocumentVersionDto {

    private UUID versionId;
    private UUID documentId;
    private Integer versionNumber;
    private String uploadedByName;
    private Instant uploadedAt;
    private String changeSummary;
    private Long fileSizeBytes;

    public static DocumentVersionDto from(DocumentVersion v) {
        DocumentVersionDto dto = new DocumentVersionDto();
        dto.versionId = v.getVersionId();
        dto.documentId = v.getDocument() != null ? v.getDocument().getDocumentId() : null;
        dto.versionNumber = v.getVersionNumber();
        dto.uploadedByName = v.getUploadedBy() != null ? v.getUploadedBy().getFullName() : null;
        dto.uploadedAt = v.getUploadedAt();
        dto.changeSummary = v.getChangeSummary();
        dto.fileSizeBytes = v.getFileSizeBytes();
        return dto;
    }

    public UUID getVersionId() { return versionId; }
    public void setVersionId(UUID versionId) { this.versionId = versionId; }
    public UUID getDocumentId() { return documentId; }
    public void setDocumentId(UUID documentId) { this.documentId = documentId; }
    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }
    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }
    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
    public String getChangeSummary() { return changeSummary; }
    public void setChangeSummary(String changeSummary) { this.changeSummary = changeSummary; }
    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }
}
