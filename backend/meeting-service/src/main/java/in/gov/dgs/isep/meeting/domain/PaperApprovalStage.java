package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "paper_approval_stages", schema = "workflow")
public class PaperApprovalStage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "stage_id")
    private UUID stageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paper_id", nullable = false)
    private Paper paper;

    @Column(name = "stage_number", nullable = false)
    private Integer stageNumber;

    @Column(name = "stage_name", nullable = false, length = 100)
    private String stageName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_user_id")
    private User approverUser;

    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "acted_at")
    private Instant actedAt;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public PaperApprovalStage() {}

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getStageId() { return stageId; }
    public void setStageId(UUID stageId) { this.stageId = stageId; }
    public Paper getPaper() { return paper; }
    public void setPaper(Paper paper) { this.paper = paper; }
    public Integer getStageNumber() { return stageNumber; }
    public void setStageNumber(Integer stageNumber) { this.stageNumber = stageNumber; }
    public String getStageName() { return stageName; }
    public void setStageName(String stageName) { this.stageName = stageName; }
    public User getApproverUser() { return approverUser; }
    public void setApproverUser(User approverUser) { this.approverUser = approverUser; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getActedAt() { return actedAt; }
    public void setActedAt(Instant actedAt) { this.actedAt = actedAt; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
