package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.PaperApprovalStage;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class PaperApprovalDto {

    private UUID paperId;
    private String paperTitle;
    private String currentStage;
    private List<StageDto> stages;

    public static PaperApprovalDto from(UUID paperId, String paperTitle, List<PaperApprovalStage> stageList) {
        PaperApprovalDto dto = new PaperApprovalDto();
        dto.paperId = paperId;
        dto.paperTitle = paperTitle;
        String current = null;
        for (PaperApprovalStage s : stageList) {
            if ("PENDING".equals(s.getStatus())) {
                current = s.getStageName();
                break;
            }
            current = s.getStageName();
        }
        dto.currentStage = current != null ? current : (stageList.isEmpty() ? "DRAFT" : "COMPLETED");
        dto.stages = stageList.stream().map(StageDto::from).collect(Collectors.toList());
        return dto;
    }

    public UUID getPaperId() { return paperId; }
    public void setPaperId(UUID paperId) { this.paperId = paperId; }
    public String getPaperTitle() { return paperTitle; }
    public void setPaperTitle(String paperTitle) { this.paperTitle = paperTitle; }
    public String getCurrentStage() { return currentStage; }
    public void setCurrentStage(String currentStage) { this.currentStage = currentStage; }
    public List<StageDto> getStages() { return stages; }
    public void setStages(List<StageDto> stages) { this.stages = stages; }

    public static class StageDto {
        private UUID stageId;
        private int stageNumber;
        private String stageName;
        private String approverName;
        private String status;
        private Instant actedAt;
        private String comments;

        public static StageDto from(PaperApprovalStage s) {
            StageDto dto = new StageDto();
            dto.stageId = s.getStageId();
            dto.stageNumber = s.getStageNumber() != null ? s.getStageNumber() : 0;
            dto.stageName = s.getStageName();
            dto.approverName = s.getApproverUser() != null ? s.getApproverUser().getFullName() : null;
            dto.status = s.getStatus();
            dto.actedAt = s.getActedAt();
            dto.comments = s.getComments();
            return dto;
        }

        public UUID getStageId() { return stageId; }
        public void setStageId(UUID stageId) { this.stageId = stageId; }
        public int getStageNumber() { return stageNumber; }
        public void setStageNumber(int stageNumber) { this.stageNumber = stageNumber; }
        public String getStageName() { return stageName; }
        public void setStageName(String stageName) { this.stageName = stageName; }
        public String getApproverName() { return approverName; }
        public void setApproverName(String approverName) { this.approverName = approverName; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Instant getActedAt() { return actedAt; }
        public void setActedAt(Instant actedAt) { this.actedAt = actedAt; }
        public String getComments() { return comments; }
        public void setComments(String comments) { this.comments = comments; }
    }
}
