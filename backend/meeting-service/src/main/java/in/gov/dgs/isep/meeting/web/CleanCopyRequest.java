package in.gov.dgs.isep.meeting.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CleanCopyRequest {

    @NotNull
    private Integer fromVersion;
    @NotNull
    private Integer toVersion;
    /** ACCEPT_ALL | REJECT_ALL | USE_DECISIONS */
    @NotBlank
    private String strategy;

    public Integer getFromVersion() { return fromVersion; }
    public void setFromVersion(Integer fromVersion) { this.fromVersion = fromVersion; }
    public Integer getToVersion() { return toVersion; }
    public void setToVersion(Integer toVersion) { this.toVersion = toVersion; }
    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }
}
