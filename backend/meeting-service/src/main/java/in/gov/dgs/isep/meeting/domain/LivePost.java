package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "live_posts", schema = "collaboration")
public class LivePost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agenda_item_id")
    private AgendaItem agendaItem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "posted_by", nullable = false)
    private User postedBy;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "post_type", nullable = false, length = 20)
    private String postType = "COMMENT";

    @Column(name = "is_official", nullable = false)
    private boolean official = false;

    @Column(name = "posted_at", nullable = false)
    private Instant postedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public LivePost() {}

    @PrePersist
    void prePersist() {
        Instant n = Instant.now();
        if (postedAt == null) {
            postedAt = n;
        }
        if (createdAt == null) {
            createdAt = n;
        }
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

    public AgendaItem getAgendaItem() {
        return agendaItem;
    }

    public void setAgendaItem(AgendaItem agendaItem) {
        this.agendaItem = agendaItem;
    }

    public User getPostedBy() {
        return postedBy;
    }

    public void setPostedBy(User postedBy) {
        this.postedBy = postedBy;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getPostType() {
        return postType;
    }

    public void setPostType(String postType) {
        this.postType = postType;
    }

    public boolean isOfficial() {
        return official;
    }

    public void setOfficial(boolean official) {
        this.official = official;
    }

    public Instant getPostedAt() {
        return postedAt;
    }

    public void setPostedAt(Instant postedAt) {
        this.postedAt = postedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
