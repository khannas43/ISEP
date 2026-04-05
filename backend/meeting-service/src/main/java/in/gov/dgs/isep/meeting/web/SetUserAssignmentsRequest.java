package in.gov.dgs.isep.meeting.web;

import java.util.List;
import java.util.UUID;

/**
 * Request body for PUT /api/v1/users/{id}/assignments.
 */
public class SetUserAssignmentsRequest {

    private List<UUID> bodyIds;
    private List<UUID> cgIds;

    public List<UUID> getBodyIds() { return bodyIds; }
    public void setBodyIds(List<UUID> bodyIds) { this.bodyIds = bodyIds; }
    public List<UUID> getCgIds() { return cgIds; }
    public void setCgIds(List<UUID> cgIds) { this.cgIds = cgIds; }
}
