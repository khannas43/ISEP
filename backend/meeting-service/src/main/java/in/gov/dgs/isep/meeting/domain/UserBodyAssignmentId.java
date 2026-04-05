package in.gov.dgs.isep.meeting.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class UserBodyAssignmentId implements Serializable {

    private UUID userId;
    private UUID bodyId;

    public UserBodyAssignmentId() {}

    public UserBodyAssignmentId(UUID userId, UUID bodyId) {
        this.userId = userId;
        this.bodyId = bodyId;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getBodyId() { return bodyId; }
    public void setBodyId(UUID bodyId) { this.bodyId = bodyId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserBodyAssignmentId that = (UserBodyAssignmentId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(bodyId, that.bodyId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, bodyId);
    }
}
