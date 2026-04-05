package in.gov.dgs.isep.meeting.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class CreateInterventionRequest {

    @NotNull
    private UUID agendaItemId;

    @NotBlank
    private String interventionText;

    private String deliveredByName;

    private String interventionType; // SUPPORT, OPPOSE, PROPOSE_AMENDMENT, INFORMATION

    public UUID getAgendaItemId() { return agendaItemId; }
    public void setAgendaItemId(UUID agendaItemId) { this.agendaItemId = agendaItemId; }
    public String getInterventionText() { return interventionText; }
    public void setInterventionText(String interventionText) { this.interventionText = interventionText; }
    public String getDeliveredByName() { return deliveredByName; }
    public void setDeliveredByName(String deliveredByName) { this.deliveredByName = deliveredByName; }
    public String getInterventionType() { return interventionType; }
    public void setInterventionType(String interventionType) { this.interventionType = interventionType; }
}
