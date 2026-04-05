package in.gov.dgs.isep.meeting.web;

import java.time.Instant;
import java.util.List;

/** Payload for GET /api/v1/papers/{id}/status (SCR-PAPER-03 polish). */
public class PaperStatusResponse {

    private String paperTitle;
    private String currentStage;
    private boolean mopswStepActive;
    private Instant submittedAt;
    private String lastActionBy;
    private Instant lastActionAt;
    private List<PaperApprovalDto.StageDto> stages;

    public static PaperStatusResponse of(
            String paperTitle,
            String currentStage,
            boolean mopswStepActive,
            Instant submittedAt,
            String lastActionBy,
            Instant lastActionAt,
            List<PaperApprovalDto.StageDto> stages
    ) {
        PaperStatusResponse r = new PaperStatusResponse();
        r.paperTitle = paperTitle;
        r.currentStage = currentStage;
        r.mopswStepActive = mopswStepActive;
        r.submittedAt = submittedAt;
        r.lastActionBy = lastActionBy;
        r.lastActionAt = lastActionAt;
        r.stages = stages;
        return r;
    }

    public String getPaperTitle() { return paperTitle; }
    public void setPaperTitle(String paperTitle) { this.paperTitle = paperTitle; }
    public String getCurrentStage() { return currentStage; }
    public void setCurrentStage(String currentStage) { this.currentStage = currentStage; }
    public boolean isMopswStepActive() { return mopswStepActive; }
    public void setMopswStepActive(boolean mopswStepActive) { this.mopswStepActive = mopswStepActive; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    public String getLastActionBy() { return lastActionBy; }
    public void setLastActionBy(String lastActionBy) { this.lastActionBy = lastActionBy; }
    public Instant getLastActionAt() { return lastActionAt; }
    public void setLastActionAt(Instant lastActionAt) { this.lastActionAt = lastActionAt; }
    public List<PaperApprovalDto.StageDto> getStages() { return stages; }
    public void setStages(List<PaperApprovalDto.StageDto> stages) { this.stages = stages; }
}
