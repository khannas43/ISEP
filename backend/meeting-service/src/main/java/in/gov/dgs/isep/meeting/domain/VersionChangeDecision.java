package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "version_change_decisions", schema = "documents")
public class VersionChangeDecision {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "from_version", nullable = false)
    private Integer fromVersion;

    @Column(name = "to_version", nullable = false)
    private Integer toVersion;

    @Column(name = "change_index", nullable = false)
    private Integer changeIndex;

    @Column(nullable = false, length = 10)
    private String decision;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "decided_by", nullable = false)
    private User decidedBy;

    @Column(name = "decided_at", nullable = false)
    private Instant decidedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (decidedAt == null) decidedAt = now;
        if (createdAt == null) createdAt = now;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }
    public Integer getFromVersion() { return fromVersion; }
    public void setFromVersion(Integer fromVersion) { this.fromVersion = fromVersion; }
    public Integer getToVersion() { return toVersion; }
    public void setToVersion(Integer toVersion) { this.toVersion = toVersion; }
    public Integer getChangeIndex() { return changeIndex; }
    public void setChangeIndex(Integer changeIndex) { this.changeIndex = changeIndex; }
    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
    public User getDecidedBy() { return decidedBy; }
    public void setDecidedBy(User decidedBy) { this.decidedBy = decidedBy; }
    public Instant getDecidedAt() { return decidedAt; }
    public void setDecidedAt(Instant decidedAt) { this.decidedAt = decidedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
