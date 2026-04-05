package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.MeetingOutcome;

import java.time.Instant;
import java.util.UUID;

public class OutcomeDto {

    private UUID outcomeId;
    private UUID meetingId;
    private UUID agendaItemId;
    private String agendaItemTitle;
    private String decision;
    private String resolutionRef;
    private String nextSteps;
    private Instant capturedAt;

    public static OutcomeDto from(MeetingOutcome o) {
        OutcomeDto dto = new OutcomeDto();
        dto.setOutcomeId(o.getOutcomeId());
        dto.setMeetingId(o.getMeeting() != null ? o.getMeeting().getMeetingId() : null);
        dto.setAgendaItemId(o.getAgendaItem() != null ? o.getAgendaItem().getAgendaItemId() : null);
        dto.setAgendaItemTitle(o.getAgendaItem() != null ? o.getAgendaItem().getTitle() : null);
        dto.setDecision(o.getDecision());
        dto.setResolutionRef(o.getResolutionRef());
        dto.setNextSteps(o.getNextSteps());
        dto.setCapturedAt(o.getCapturedAt());
        return dto;
    }

    public UUID getOutcomeId() { return outcomeId; }
    public void setOutcomeId(UUID outcomeId) { this.outcomeId = outcomeId; }
    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }
    public UUID getAgendaItemId() { return agendaItemId; }
    public void setAgendaItemId(UUID agendaItemId) { this.agendaItemId = agendaItemId; }
    public String getAgendaItemTitle() { return agendaItemTitle; }
    public void setAgendaItemTitle(String agendaItemTitle) { this.agendaItemTitle = agendaItemTitle; }
    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
    public String getResolutionRef() { return resolutionRef; }
    public void setResolutionRef(String resolutionRef) { this.resolutionRef = resolutionRef; }
    public String getNextSteps() { return nextSteps; }
    public void setNextSteps(String nextSteps) { this.nextSteps = nextSteps; }
    public Instant getCapturedAt() { return capturedAt; }
    public void setCapturedAt(Instant capturedAt) { this.capturedAt = capturedAt; }
}
