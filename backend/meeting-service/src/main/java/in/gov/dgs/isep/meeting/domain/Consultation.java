package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "consultations", schema = "documents")
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sent_by", nullable = false)
    private User sentBy;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    private LocalDate deadline;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, length = 20)
    private String status = "OPEN";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Consultation() {}

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (sentAt == null) sentAt = now;
        if (createdAt == null) createdAt = now;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }
    public User getSentBy() { return sentBy; }
    public void setSentBy(User sentBy) { this.sentBy = sentBy; }
    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
