package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.MeetingIntervention;

import java.time.Instant;
import java.util.UUID;

public class InterventionDto {

    private UUID interventionId;
    private UUID meetingId;
    private UUID agendaItemId;
    private String agendaItemTitle;
    private String interventionText;
    private String deliveredByName;
    private Instant deliveredAt;
    private String interventionType;

    public static InterventionDto from(MeetingIntervention i) {
        InterventionDto dto = new InterventionDto();
        dto.setInterventionId(i.getInterventionId());
        dto.setMeetingId(i.getMeeting() != null ? i.getMeeting().getMeetingId() : null);
        dto.setAgendaItemId(i.getAgendaItem() != null ? i.getAgendaItem().getAgendaItemId() : null);
        dto.setAgendaItemTitle(i.getAgendaItem() != null ? i.getAgendaItem().getTitle() : null);
        dto.setInterventionText(i.getInterventionText());
        dto.setDeliveredByName(i.getDeliveredByName() != null ? i.getDeliveredByName() : (i.getDeliveredByUser() != null ? i.getDeliveredByUser().getFullName() : null));
        dto.setDeliveredAt(i.getDeliveredAt());
        dto.setInterventionType(i.getInterventionType());
        return dto;
    }

    public UUID getInterventionId() { return interventionId; }
    public void setInterventionId(UUID interventionId) { this.interventionId = interventionId; }
    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }
    public UUID getAgendaItemId() { return agendaItemId; }
    public void setAgendaItemId(UUID agendaItemId) { this.agendaItemId = agendaItemId; }
    public String getAgendaItemTitle() { return agendaItemTitle; }
    public void setAgendaItemTitle(String agendaItemTitle) { this.agendaItemTitle = agendaItemTitle; }
    public String getInterventionText() { return interventionText; }
    public void setInterventionText(String interventionText) { this.interventionText = interventionText; }
    public String getDeliveredByName() { return deliveredByName; }
    public void setDeliveredByName(String deliveredByName) { this.deliveredByName = deliveredByName; }
    public Instant getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; }
    public String getInterventionType() { return interventionType; }
    public void setInterventionType(String interventionType) { this.interventionType = interventionType; }
}
