package in.gov.dgs.isep.meeting.web;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public class UpdateCorrespondenceGroupRequest {

    private UUID parentBodyId;

    @Size(max = 500)
    private String name;

    private String mandate;

    private UUID indiaLeadId;

    private LocalDate startDate;

    private LocalDate endDate;

    @Size(max = 20)
    private String status;

    @Size(max = 255)
    private String imsoReference;

    public UUID getParentBodyId() { return parentBodyId; }
    public void setParentBodyId(UUID parentBodyId) { this.parentBodyId = parentBodyId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMandate() { return mandate; }
    public void setMandate(String mandate) { this.mandate = mandate; }
    public UUID getIndiaLeadId() { return indiaLeadId; }
    public void setIndiaLeadId(UUID indiaLeadId) { this.indiaLeadId = indiaLeadId; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getImsoReference() { return imsoReference; }
    public void setImsoReference(String imsoReference) { this.imsoReference = imsoReference; }
}
