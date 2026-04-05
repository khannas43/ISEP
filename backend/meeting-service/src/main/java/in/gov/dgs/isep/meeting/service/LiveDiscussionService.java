package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.AgendaItem;
import in.gov.dgs.isep.meeting.domain.LivePost;
import in.gov.dgs.isep.meeting.domain.Meeting;
import in.gov.dgs.isep.meeting.repository.AgendaItemRepository;
import in.gov.dgs.isep.meeting.repository.LivePostRepository;
import in.gov.dgs.isep.meeting.repository.MeetingRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.web.CreateLivePostRequest;
import in.gov.dgs.isep.meeting.web.LivePostDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class LiveDiscussionService {

    private static final Set<String> POST_TYPES = Set.of("COMMENT", "INTERVENTION", "POINT_OF_ORDER", "INFORMATION");

    private final MeetingRepository meetingRepository;
    private final AgendaItemRepository agendaItemRepository;
    private final LivePostRepository livePostRepository;
    private final UserRepository userRepository;
    private final LiveMeetingSseService sseService;

    public LiveDiscussionService(
            MeetingRepository meetingRepository,
            AgendaItemRepository agendaItemRepository,
            LivePostRepository livePostRepository,
            UserRepository userRepository,
            LiveMeetingSseService sseService) {
        this.meetingRepository = meetingRepository;
        this.agendaItemRepository = agendaItemRepository;
        this.livePostRepository = livePostRepository;
        this.userRepository = userRepository;
        this.sseService = sseService;
    }

    @Transactional(readOnly = true)
    public List<LivePostDto> listPosts(UUID meetingId, UUID agendaItemId) {
        meetingRepository.findById(meetingId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting not found"));
        agendaItemRepository
                .findByAgendaItemIdAndMeeting_MeetingId(agendaItemId, meetingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agenda item not found"));
        return livePostRepository
                .findByMeetingMeetingIdAndAgendaItemAgendaItemIdOrderByPostedAtAsc(meetingId, agendaItemId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public LivePostDto createPost(UUID meetingId, UUID agendaItemId, CreateLivePostRequest request, UUID userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not resolved");
        }
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting not found"));
        if (!meeting.isLiveSessionActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Meeting not in live mode");
        }
        AgendaItem item = agendaItemRepository
                .findByAgendaItemIdAndMeeting_MeetingId(agendaItemId, meetingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agenda item not found"));
        if (item.isDiscussionLocked()) {
            throw new ResponseStatusException(HttpStatus.LOCKED, "Discussion locked");
        }
        String type = request.postType() != null && !request.postType().isBlank() ? request.postType().trim().toUpperCase() : "COMMENT";
        if (!POST_TYPES.contains(type)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid postType");
        }

        LivePost post = new LivePost();
        post.setMeeting(meeting);
        post.setAgendaItem(item);
        post.setPostedBy(userRepository.getReferenceById(userId));
        post.setContent(request.content().trim());
        post.setPostType(type);
        post.setPostedAt(Instant.now());
        post = livePostRepository.save(post);

        LivePostDto dto = toDto(post);
        sseService.publish(meetingId, dto);
        return dto;
    }

    @Transactional
    public void activateLiveSession(UUID meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting not found"));
        meeting.setLiveSessionActive(true);
        meeting.setLiveSessionStartedAt(Instant.now());
        meetingRepository.save(meeting);
    }

    @Transactional
    public void lockDiscussion(UUID meetingId, UUID agendaItemId, UUID userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not resolved");
        }
        AgendaItem item = agendaItemRepository
                .findByAgendaItemIdAndMeeting_MeetingId(agendaItemId, meetingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agenda item not found"));
        item.setDiscussionLocked(true);
        item.setDiscussionLockedBy(userRepository.getReferenceById(userId));
        item.setDiscussionLockedAt(Instant.now());
        agendaItemRepository.save(item);
    }

    private LivePostDto toDto(LivePost p) {
        UUID agendaId = p.getAgendaItem() != null ? p.getAgendaItem().getAgendaItemId() : null;
        String name = p.getPostedBy() != null ? p.getPostedBy().getFullName() : "—";
        return new LivePostDto(
                p.getId(),
                p.getMeeting().getMeetingId(),
                agendaId,
                p.getPostedBy().getUserId(),
                name,
                p.getContent(),
                p.getPostType(),
                p.getPostedAt(),
                p.isOfficial());
    }
}
