package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "meeting_interventions", schema = "core")
public class MeetingIntervention {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "intervention_id")
    private UUID interventionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "agenda_item_id", nullable = false)
    private AgendaItem agendaItem;

    @Column(name = "intervention_text", nullable = false, columnDefinition = "TEXT")
    private String interventionText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivered_by_user_id")
    private User deliveredByUser;

    @Column(name = "delivered_by_name", length = 255)
    private String deliveredByName;

    @Column(name = "delivered_at", nullable = false)
    private Instant deliveredAt;

    @Column(name = "intervention_type", nullable = false, length = 50)
    private String interventionType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public MeetingIntervention() {}

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (deliveredAt == null) deliveredAt = Instant.now();
    }

    public UUID getInterventionId() { return interventionId; }
    public void setInterventionId(UUID interventionId) { this.interventionId = interventionId; }
    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }
    public AgendaItem getAgendaItem() { return agendaItem; }
    public void setAgendaItem(AgendaItem agendaItem) { this.agendaItem = agendaItem; }
    public String getInterventionText() { return interventionText; }
    public void setInterventionText(String interventionText) { this.interventionText = interventionText; }
    public User getDeliveredByUser() { return deliveredByUser; }
    public void setDeliveredByUser(User deliveredByUser) { this.deliveredByUser = deliveredByUser; }
    public String getDeliveredByName() { return deliveredByName; }
    public void setDeliveredByName(String deliveredByName) { this.deliveredByName = deliveredByName; }
    public Instant getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; }
    public String getInterventionType() { return interventionType; }
    public void setInterventionType(String interventionType) { this.interventionType = interventionType; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
