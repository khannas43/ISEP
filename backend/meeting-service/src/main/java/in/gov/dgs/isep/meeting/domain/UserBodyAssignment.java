package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "user_body_assignments", schema = "core")
@IdClass(UserBodyAssignmentId.class)
public class UserBodyAssignment {

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Id
    @Column(name = "body_id", nullable = false)
    private UUID bodyId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "body_id", nullable = false, insertable = false, updatable = false)
    private InternationalBody body;

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getBodyId() { return bodyId; }
    public void setBodyId(UUID bodyId) { this.bodyId = bodyId; }
    public User getUser() { return user; }
    public void setUser(User user) {
        this.user = user;
        this.userId = user != null ? user.getUserId() : null;
    }
    public InternationalBody getBody() { return body; }
    public void setBody(InternationalBody body) {
        this.body = body;
        this.bodyId = body != null ? body.getBodyId() : null;
    }
}
