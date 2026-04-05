package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "international_bodies", schema = "core")
public class InternationalBody {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID bodyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_body_id")
    private InternationalBody parentBody;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(length = 50)
    private String abbreviation;

    @Enumerated(EnumType.STRING)
    @Column(name = "body_type", nullable = false, length = 50)
    private BodyType bodyType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public InternationalBody() {}

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

    public UUID getBodyId() { return bodyId; }
    public void setBodyId(UUID bodyId) { this.bodyId = bodyId; }
    public InternationalBody getParentBody() { return parentBody; }
    public void setParentBody(InternationalBody parentBody) { this.parentBody = parentBody; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAbbreviation() { return abbreviation; }
    public void setAbbreviation(String abbreviation) { this.abbreviation = abbreviation; }
    public BodyType getBodyType() { return bodyType; }
    public void setBodyType(BodyType bodyType) { this.bodyType = bodyType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public enum BodyType {
        ASSEMBLY, COUNCIL, COMMITTEE, SUB_COMMITTEE,
        WORKING_GROUP, CORRESPONDENCE_GROUP, BILATERAL, OTHER
    }
}
