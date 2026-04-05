package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Formal paper (India's submission, working document) for a meeting/agenda item.
 * Draft content is TipTap JSON; version incremented on each save for optimistic locking.
 */
@Entity
@Table(name = "papers", schema = "core")
public class Paper {

    @Id
    @Column(name = "paper_id")
    private UUID paperId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agenda_item_id")
    private AgendaItem agendaItem;

    @Column(name = "clean_copy_document_id")
    private UUID cleanCopyDocumentId;

    @Column(length = 500)
    private String title;

    @Column(length = 50)
    private String status = "DRAFT";

    @Column(name = "draft_content", columnDefinition = "TEXT")
    private String draftContent;

    @Column(name = "draft_version", nullable = false)
    private int draftVersion = 0;

    @Column(name = "draft_saved_at")
    private Instant draftSavedAt;

    @Column(name = "draft_last_modified_by")
    private UUID draftLastModifiedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Paper() {}

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getPaperId() { return paperId; }
    public void setPaperId(UUID paperId) { this.paperId = paperId; }
    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }
    public AgendaItem getAgendaItem() { return agendaItem; }
    public void setAgendaItem(AgendaItem agendaItem) { this.agendaItem = agendaItem; }
    public UUID getCleanCopyDocumentId() { return cleanCopyDocumentId; }
    public void setCleanCopyDocumentId(UUID cleanCopyDocumentId) { this.cleanCopyDocumentId = cleanCopyDocumentId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDraftContent() { return draftContent; }
    public void setDraftContent(String draftContent) { this.draftContent = draftContent; }
    public int getDraftVersion() { return draftVersion; }
    public void setDraftVersion(int draftVersion) { this.draftVersion = draftVersion; }
    public Instant getDraftSavedAt() { return draftSavedAt; }
    public void setDraftSavedAt(Instant draftSavedAt) { this.draftSavedAt = draftSavedAt; }
    public UUID getDraftLastModifiedBy() { return draftLastModifiedBy; }
    public void setDraftLastModifiedBy(UUID draftLastModifiedBy) { this.draftLastModifiedBy = draftLastModifiedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
