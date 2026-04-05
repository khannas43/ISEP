package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.Document;

import java.time.Instant;
import java.util.UUID;

public class DocumentDto {

    private UUID documentId;
    private UUID meetingId;
    private UUID agendaItemId;
    private String documentType;
    private String title;
    private String source;
    private String fileName;
    private Long fileSizeBytes;
    private String mimeType;
    private Integer currentVersion;
    private String status;
    private String uploadedByName;
    private Instant uploadedAt;

    public static DocumentDto from(Document d) {
        DocumentDto dto = new DocumentDto();
        dto.documentId = d.getDocumentId();
        dto.meetingId = d.getMeeting() != null ? d.getMeeting().getMeetingId() : null;
        dto.agendaItemId = d.getAgendaItem() != null ? d.getAgendaItem().getAgendaItemId() : null;
        dto.documentType = d.getDocumentType();
        dto.title = d.getTitle();
        dto.source = d.getSource();
        dto.fileName = d.getFileName();
        dto.fileSizeBytes = d.getFileSizeBytes();
        dto.mimeType = d.getMimeType();
        dto.currentVersion = d.getCurrentVersion();
        dto.status = d.getStatus();
        dto.uploadedByName = d.getUploadedBy() != null ? d.getUploadedBy().getFullName() : null;
        dto.uploadedAt = d.getUploadedAt();
        return dto;
    }

    public UUID getDocumentId() { return documentId; }
    public void setDocumentId(UUID documentId) { this.documentId = documentId; }
    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }
    public UUID getAgendaItemId() { return agendaItemId; }
    public void setAgendaItemId(UUID agendaItemId) { this.agendaItemId = agendaItemId; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    public Integer getCurrentVersion() { return currentVersion; }
    public void setCurrentVersion(Integer currentVersion) { this.currentVersion = currentVersion; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }
    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
}
