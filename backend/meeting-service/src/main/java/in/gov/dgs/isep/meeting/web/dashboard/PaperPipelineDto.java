package in.gov.dgs.isep.meeting.web.dashboard;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaperPipelineDto {

    private String id;
    private String title;
    private String agendaItem;
    private int stage;
    private String stageName;
    private String lastAction;
    private String lastActionDate;
    private String submittedBy;
    private boolean urgent;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAgendaItem() { return agendaItem; }
    public void setAgendaItem(String agendaItem) { this.agendaItem = agendaItem; }
    public int getStage() { return stage; }
    public void setStage(int stage) { this.stage = stage; }
    public String getStageName() { return stageName; }
    public void setStageName(String stageName) { this.stageName = stageName; }
    public String getLastAction() { return lastAction; }
    public void setLastAction(String lastAction) { this.lastAction = lastAction; }
    public String getLastActionDate() { return lastActionDate; }
    public void setLastActionDate(String lastActionDate) { this.lastActionDate = lastActionDate; }
    public String getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(String submittedBy) { this.submittedBy = submittedBy; }
    public boolean isUrgent() { return urgent; }
    public void setUrgent(boolean urgent) { this.urgent = urgent; }
}
