package in.gov.dgs.isep.meeting.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class CreateOutcomeRequest {

    @NotNull
    private UUID agendaItemId;

    @NotBlank
    private String decision;

    private String resolutionRef;
    private String nextSteps;

    public UUID getAgendaItemId() { return agendaItemId; }
    public void setAgendaItemId(UUID agendaItemId) { this.agendaItemId = agendaItemId; }
    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
    public String getResolutionRef() { return resolutionRef; }
    public void setResolutionRef(String resolutionRef) { this.resolutionRef = resolutionRef; }
    public String getNextSteps() { return nextSteps; }
    public void setNextSteps(String nextSteps) { this.nextSteps = nextSteps; }
}
