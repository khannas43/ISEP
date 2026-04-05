package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "cg_members", schema = "correspondence")
public class CgMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "cg_member_id")
    private UUID cgMemberId;

    @Column(name = "cg_id", nullable = false)
    private UUID cgId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "role", length = 50)
    private String role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cg_id", nullable = false, insertable = false, updatable = false)
    private CorrespondenceGroup correspondenceGroup;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, insertable = false, updatable = false)
    private User user;

    public UUID getCgMemberId() { return cgMemberId; }
    public void setCgMemberId(UUID cgMemberId) { this.cgMemberId = cgMemberId; }
    public UUID getCgId() { return cgId; }
    public void setCgId(UUID cgId) { this.cgId = cgId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public CorrespondenceGroup getCorrespondenceGroup() { return correspondenceGroup; }
    public void setCorrespondenceGroup(CorrespondenceGroup cg) {
        this.correspondenceGroup = cg;
        this.cgId = cg != null ? cg.getCgId() : null;
    }
    public User getUser() { return user; }
    public void setUser(User user) {
        this.user = user;
        this.userId = user != null ? user.getUserId() : null;
    }
}
