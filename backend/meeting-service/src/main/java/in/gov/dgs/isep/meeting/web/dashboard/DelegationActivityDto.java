package in.gov.dgs.isep.meeting.web.dashboard;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DelegationActivityDto {

    private String org;
    private String role;
    private int tasksComplete;
    private int tasksTotal;
    private int feedbackSubmitted;
    private int papersOwned;
    private String status;

    public String getOrg() { return org; }
    public void setOrg(String org) { this.org = org; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public int getTasksComplete() { return tasksComplete; }
    public void setTasksComplete(int tasksComplete) { this.tasksComplete = tasksComplete; }
    public int getTasksTotal() { return tasksTotal; }
    public void setTasksTotal(int tasksTotal) { this.tasksTotal = tasksTotal; }
    public int getFeedbackSubmitted() { return feedbackSubmitted; }
    public void setFeedbackSubmitted(int feedbackSubmitted) { this.feedbackSubmitted = feedbackSubmitted; }
    public int getPapersOwned() { return papersOwned; }
    public void setPapersOwned(int papersOwned) { this.papersOwned = papersOwned; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
