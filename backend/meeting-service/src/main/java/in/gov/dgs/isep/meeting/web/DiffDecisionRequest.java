package in.gov.dgs.isep.meeting.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DiffDecisionRequest {

    @NotNull
    private Integer fromVersion;
    @NotNull
    private Integer toVersion;
    @NotNull
    private Integer changeIndex;
    @NotBlank
    private String decision;

    public Integer getFromVersion() { return fromVersion; }
    public void setFromVersion(Integer fromVersion) { this.fromVersion = fromVersion; }
    public Integer getToVersion() { return toVersion; }
    public void setToVersion(Integer toVersion) { this.toVersion = toVersion; }
    public Integer getChangeIndex() { return changeIndex; }
    public void setChangeIndex(Integer changeIndex) { this.changeIndex = changeIndex; }
    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
}
