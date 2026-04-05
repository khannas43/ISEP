package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** JPA entity for core.meetings. Links to InternationalBody; has status (PLANNED, ACTIVE, CONCLUDED, etc.) and meeting type (IN_PERSON, VIRTUAL, HYBRID). */
@Entity
@Table(name = "meetings", schema = "core")
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID meetingId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "body_id", nullable = false)
    private InternationalBody body;

    @Column(name = "session_number", length = 50)
    private String sessionNumber;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(length = 500)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "meeting_type", nullable = false, length = 20)
    private MeetingType meetingType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MeetingStatus status = MeetingStatus.PLANNED;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "live_session_active", nullable = false)
    private boolean liveSessionActive = false;

    @Column(name = "live_session_started_at")
    private Instant liveSessionStartedAt;

    public Meeting() {}

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getMeetingId() { return meetingId; }
    public void setMeetingId(UUID meetingId) { this.meetingId = meetingId; }
    public InternationalBody getBody() { return body; }
    public void setBody(InternationalBody body) { this.body = body; }
    public String getSessionNumber() { return sessionNumber; }
    public void setSessionNumber(String sessionNumber) { this.sessionNumber = sessionNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public MeetingType getMeetingType() { return meetingType; }
    public void setMeetingType(MeetingType meetingType) { this.meetingType = meetingType; }
    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public boolean isLiveSessionActive() {
        return liveSessionActive;
    }

    public void setLiveSessionActive(boolean liveSessionActive) {
        this.liveSessionActive = liveSessionActive;
    }

    public Instant getLiveSessionStartedAt() {
        return liveSessionStartedAt;
    }

    public void setLiveSessionStartedAt(Instant liveSessionStartedAt) {
        this.liveSessionStartedAt = liveSessionStartedAt;
    }

    public enum MeetingType {
        IN_PERSON, VIRTUAL, HYBRID
    }

    public enum MeetingStatus {
        PLANNED, ACTIVE, CONCLUDED, ARCHIVED, CANCELLED
    }
}
