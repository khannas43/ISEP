package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "correspondence_groups", schema = "correspondence")
public class CorrespondenceGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "cg_id")
    private UUID cgId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_body_id", nullable = false)
    private InternationalBody parentBody;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String mandate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "india_lead_id")
    private User indiaLead;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "imso_reference", length = 255)
    private String imsoReference;

    public UUID getCgId() { return cgId; }
    public void setCgId(UUID cgId) { this.cgId = cgId; }
    public InternationalBody getParentBody() { return parentBody; }
    public void setParentBody(InternationalBody parentBody) { this.parentBody = parentBody; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMandate() { return mandate; }
    public void setMandate(String mandate) { this.mandate = mandate; }
    public User getIndiaLead() { return indiaLead; }
    public void setIndiaLead(User indiaLead) { this.indiaLead = indiaLead; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getImsoReference() { return imsoReference; }
    public void setImsoReference(String imsoReference) { this.imsoReference = imsoReference; }
}
