package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.CorrespondenceGroup;

import java.time.LocalDate;
import java.util.UUID;

/** DTO for correspondence group with assigned-to-meeting flag (for picker UI). */
public class CorrespondenceGroupWithAssignedDto extends CorrespondenceGroupDto {

    private boolean assigned;

    public static CorrespondenceGroupWithAssignedDto from(CorrespondenceGroup cg, boolean assigned) {
        CorrespondenceGroupWithAssignedDto dto = new CorrespondenceGroupWithAssignedDto();
        dto.setCgId(cg.getCgId());
        dto.setParentBodyId(cg.getParentBody() != null ? cg.getParentBody().getBodyId() : null);
        dto.setParentBodyName(cg.getParentBody() != null ? cg.getParentBody().getName() : null);
        dto.setName(cg.getName());
        dto.setMandate(cg.getMandate());
        if (cg.getIndiaLead() != null) {
            dto.setIndiaLeadId(cg.getIndiaLead().getUserId());
            dto.setIndiaLeadName(cg.getIndiaLead().getFullName());
        }
        dto.setStartDate(cg.getStartDate());
        dto.setEndDate(cg.getEndDate());
        dto.setStatus(cg.getStatus());
        dto.setImsoReference(cg.getImsoReference());
        dto.setAssigned(assigned);
        return dto;
    }

    public boolean isAssigned() { return assigned; }
    public void setAssigned(boolean assigned) { this.assigned = assigned; }
}
