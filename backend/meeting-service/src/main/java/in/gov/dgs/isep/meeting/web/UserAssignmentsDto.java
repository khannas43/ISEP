package in.gov.dgs.isep.meeting.web;

import java.util.List;
import java.util.UUID;

/**
 * Response for GET /api/v1/users/{id}/assignments.
 * Lists all bodies and all CGs with an "assigned" flag for the user.
 */
public class UserAssignmentsDto {

    private UUID userId;
    private String userName;
    private List<BodyAssignmentItemDto> bodies;
    private List<CgAssignmentItemDto> correspondenceGroups;

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public List<BodyAssignmentItemDto> getBodies() { return bodies; }
    public void setBodies(List<BodyAssignmentItemDto> bodies) { this.bodies = bodies; }
    public List<CgAssignmentItemDto> getCorrespondenceGroups() { return correspondenceGroups; }
    public void setCorrespondenceGroups(List<CgAssignmentItemDto> correspondenceGroups) { this.correspondenceGroups = correspondenceGroups; }

    public static class BodyAssignmentItemDto {
        private UUID bodyId;
        private String name;
        private String abbreviation;
        private boolean assigned;

        public UUID getBodyId() { return bodyId; }
        public void setBodyId(UUID bodyId) { this.bodyId = bodyId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAbbreviation() { return abbreviation; }
        public void setAbbreviation(String abbreviation) { this.abbreviation = abbreviation; }
        public boolean isAssigned() { return assigned; }
        public void setAssigned(boolean assigned) { this.assigned = assigned; }
    }

    public static class CgAssignmentItemDto {
        private UUID cgId;
        private String name;
        private UUID parentBodyId;
        private String parentBodyName;
        private boolean assigned;

        public UUID getCgId() { return cgId; }
        public void setCgId(UUID cgId) { this.cgId = cgId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public UUID getParentBodyId() { return parentBodyId; }
        public void setParentBodyId(UUID parentBodyId) { this.parentBodyId = parentBodyId; }
        public String getParentBodyName() { return parentBodyName; }
        public void setParentBodyName(String parentBodyName) { this.parentBodyName = parentBodyName; }
        public boolean isAssigned() { return assigned; }
        public void setAssigned(boolean assigned) { this.assigned = assigned; }
    }
}
