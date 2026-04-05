package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.CorrespondenceGroup;

import java.time.LocalDate;
import java.util.UUID;

public class CorrespondenceGroupDto {

    private UUID cgId;
    private UUID parentBodyId;
    private String parentBodyName;
    private String name;
    private String mandate;
    private UUID indiaLeadId;
    private String indiaLeadName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String imsoReference;

    public static CorrespondenceGroupDto from(CorrespondenceGroup cg) {
        CorrespondenceGroupDto dto = new CorrespondenceGroupDto();
        dto.cgId = cg.getCgId();
        dto.parentBodyId = cg.getParentBody() != null ? cg.getParentBody().getBodyId() : null;
        dto.parentBodyName = cg.getParentBody() != null ? cg.getParentBody().getName() : null;
        dto.name = cg.getName();
        dto.mandate = cg.getMandate();
        if (cg.getIndiaLead() != null) {
            dto.indiaLeadId = cg.getIndiaLead().getUserId();
            dto.indiaLeadName = cg.getIndiaLead().getFullName();
        }
        dto.startDate = cg.getStartDate();
        dto.endDate = cg.getEndDate();
        dto.status = cg.getStatus();
        dto.imsoReference = cg.getImsoReference();
        return dto;
    }

    public UUID getCgId() { return cgId; }
    public void setCgId(UUID cgId) { this.cgId = cgId; }
    public UUID getParentBodyId() { return parentBodyId; }
    public void setParentBodyId(UUID parentBodyId) { this.parentBodyId = parentBodyId; }
    public String getParentBodyName() { return parentBodyName; }
    public void setParentBodyName(String parentBodyName) { this.parentBodyName = parentBodyName; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMandate() { return mandate; }
    public void setMandate(String mandate) { this.mandate = mandate; }
    public UUID getIndiaLeadId() { return indiaLeadId; }
    public void setIndiaLeadId(UUID indiaLeadId) { this.indiaLeadId = indiaLeadId; }
    public String getIndiaLeadName() { return indiaLeadName; }
    public void setIndiaLeadName(String indiaLeadName) { this.indiaLeadName = indiaLeadName; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getImsoReference() { return imsoReference; }
    public void setImsoReference(String imsoReference) { this.imsoReference = imsoReference; }
}
