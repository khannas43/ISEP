package in.gov.dgs.isep.meeting.web.dashboard;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AgendaReadinessDto {

    private String id;
    private String title;
    private String priority;
    private boolean submissionRequired;
    private boolean positionReady;
    private String paperStatus;
    private int tasksComplete;
    private int tasksTotal;
    private Integer daysLeft;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public boolean isSubmissionRequired() { return submissionRequired; }
    public void setSubmissionRequired(boolean submissionRequired) { this.submissionRequired = submissionRequired; }
    public boolean isPositionReady() { return positionReady; }
    public void setPositionReady(boolean positionReady) { this.positionReady = positionReady; }
    public String getPaperStatus() { return paperStatus; }
    public void setPaperStatus(String paperStatus) { this.paperStatus = paperStatus; }
    public int getTasksComplete() { return tasksComplete; }
    public void setTasksComplete(int tasksComplete) { this.tasksComplete = tasksComplete; }
    public int getTasksTotal() { return tasksTotal; }
    public void setTasksTotal(int tasksTotal) { this.tasksTotal = tasksTotal; }
    public Integer getDaysLeft() { return daysLeft; }
    public void setDaysLeft(Integer daysLeft) { this.daysLeft = daysLeft; }
}
