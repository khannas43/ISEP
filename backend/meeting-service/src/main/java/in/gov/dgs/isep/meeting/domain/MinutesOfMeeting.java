package in.gov.dgs.isep.meeting.domain;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "minutes_of_meeting", schema = "documents")
public class MinutesOfMeeting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meeting_id", nullable = false, unique = true)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "generated_by", nullable = false)
    private User generatedBy;

    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;

    @Column(name = "attendee_count")
    private Integer attendeeCount;

    @Column(name = "agenda_items_covered")
    private Integer agendaItemsCovered;

    @Column(name = "decisions_text", columnDefinition = "TEXT")
    private String decisionsText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "action_items", columnDefinition = "jsonb")
    private JsonNode actionItems;

    @Column(name = "content_html", columnDefinition = "TEXT")
    private String contentHtml;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_json", columnDefinition = "jsonb")
    private JsonNode contentJson;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant n = Instant.now();
        if (createdAt == null) {
            createdAt = n;
        }
        updatedAt = n;
        if (generatedAt == null) {
            generatedAt = n;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Meeting getMeeting() {
        return meeting;
    }

    public void setMeeting(Meeting meeting) {
        this.meeting = meeting;
    }

    public User getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(User generatedBy) {
        this.generatedBy = generatedBy;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }

    public Integer getAttendeeCount() {
        return attendeeCount;
    }

    public void setAttendeeCount(Integer attendeeCount) {
        this.attendeeCount = attendeeCount;
    }

    public Integer getAgendaItemsCovered() {
        return agendaItemsCovered;
    }

    public void setAgendaItemsCovered(Integer agendaItemsCovered) {
        this.agendaItemsCovered = agendaItemsCovered;
    }

    public String getDecisionsText() {
        return decisionsText;
    }

    public void setDecisionsText(String decisionsText) {
        this.decisionsText = decisionsText;
    }

    public JsonNode getActionItems() {
        return actionItems;
    }

    public void setActionItems(JsonNode actionItems) {
        this.actionItems = actionItems;
    }

    public String getContentHtml() {
        return contentHtml;
    }

    public void setContentHtml(String contentHtml) {
        this.contentHtml = contentHtml;
    }

    public JsonNode getContentJson() {
        return contentJson;
    }

    public void setContentJson(JsonNode contentJson) {
        this.contentJson = contentJson;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
