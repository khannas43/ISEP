package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "meeting_outcomes", schema = "core")
public class MeetingOutcome {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "outcome_id")
    private UUID outcomeId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "agenda_item_id", nullable = false)
    private AgendaItem agendaItem;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String decision;

    @Column(name = "resolution_ref", length = 255)
    private String resolutionRef;

    @Column(name = "next_steps", columnDefinition = "TEXT")
    private String nextSteps;

    @Column(name = "captured_at", nullable = false)
    private Instant capturedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "captured_by_user_id")
    private User capturedByUser;

    public MeetingOutcome() {}

    @PrePersist
    void prePersist() {
        if (capturedAt == null) capturedAt = Instant.now();
    }

    public UUID getOutcomeId() { return outcomeId; }
    public void setOutcomeId(UUID outcomeId) { this.outcomeId = outcomeId; }
    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }
    public AgendaItem getAgendaItem() { return agendaItem; }
    public void setAgendaItem(AgendaItem agendaItem) { this.agendaItem = agendaItem; }
    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
    public String getResolutionRef() { return resolutionRef; }
    public void setResolutionRef(String resolutionRef) { this.resolutionRef = resolutionRef; }
    public String getNextSteps() { return nextSteps; }
    public void setNextSteps(String nextSteps) { this.nextSteps = nextSteps; }
    public Instant getCapturedAt() { return capturedAt; }
    public void setCapturedAt(Instant capturedAt) { this.capturedAt = capturedAt; }
    public User getCapturedByUser() { return capturedByUser; }
    public void setCapturedByUser(User capturedByUser) { this.capturedByUser = capturedByUser; }
}
