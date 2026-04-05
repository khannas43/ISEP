package in.gov.dgs.isep.meeting.web.dashboard;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardSummaryDto {

    private MeetingSummary meeting;
    private PreparednessSummary preparedness;
    private int pendingActions;
    private int criticalAlerts;

    public MeetingSummary getMeeting() { return meeting; }
    public void setMeeting(MeetingSummary meeting) { this.meeting = meeting; }
    public PreparednessSummary getPreparedness() { return preparedness; }
    public void setPreparedness(PreparednessSummary preparedness) { this.preparedness = preparedness; }
    public int getPendingActions() { return pendingActions; }
    public void setPendingActions(int pendingActions) { this.pendingActions = pendingActions; }
    public int getCriticalAlerts() { return criticalAlerts; }
    public void setCriticalAlerts(int criticalAlerts) { this.criticalAlerts = criticalAlerts; }

    public static class MeetingSummary {
        private String title;
        private String body;
        private Integer session;
        private String location;
        private String startDate;
        private String endDate;
        private Integer daysToMeeting;
        private String status;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
        public Integer getSession() { return session; }
        public void setSession(Integer session) { this.session = session; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        public Integer getDaysToMeeting() { return daysToMeeting; }
        public void setDaysToMeeting(Integer daysToMeeting) { this.daysToMeeting = daysToMeeting; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class PreparednessSummary {
        private int score;
        private int trend;
        private int tasksComplete;
        private int tasksTotal;
        private int feedbackConsolidated;
        private int feedbackTotal;
        private int papersReady;
        private int papersTotal;

        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
        public int getTrend() { return trend; }
        public void setTrend(int trend) { this.trend = trend; }
        public int getTasksComplete() { return tasksComplete; }
        public void setTasksComplete(int tasksComplete) { this.tasksComplete = tasksComplete; }
        public int getTasksTotal() { return tasksTotal; }
        public void setTasksTotal(int tasksTotal) { this.tasksTotal = tasksTotal; }
        public int getFeedbackConsolidated() { return feedbackConsolidated; }
        public void setFeedbackConsolidated(int feedbackConsolidated) { this.feedbackConsolidated = feedbackConsolidated; }
        public int getFeedbackTotal() { return feedbackTotal; }
        public void setFeedbackTotal(int feedbackTotal) { this.feedbackTotal = feedbackTotal; }
        public int getPapersReady() { return papersReady; }
        public void setPapersReady(int papersReady) { this.papersReady = papersReady; }
        public int getPapersTotal() { return papersTotal; }
        public void setPapersTotal(int papersTotal) { this.papersTotal = papersTotal; }
    }
}
