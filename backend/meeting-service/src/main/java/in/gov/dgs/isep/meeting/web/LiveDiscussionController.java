package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.service.LiveDiscussionService;
import in.gov.dgs.isep.meeting.service.LiveMeetingSseService;
import in.gov.dgs.isep.meeting.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meetings/{meetingId}/live")
public class LiveDiscussionController {

    private final LiveDiscussionService liveDiscussionService;
    private final LiveMeetingSseService sseService;
    private final UserRepository userRepository;

    public LiveDiscussionController(
            LiveDiscussionService liveDiscussionService,
            LiveMeetingSseService sseService,
            UserRepository userRepository) {
        this.liveDiscussionService = liveDiscussionService;
        this.sseService = sseService;
        this.userRepository = userRepository;
    }

    @PostMapping("/agenda/{agendaItemId}/posts")
    public ResponseEntity<LivePostDto> post(
            @PathVariable UUID meetingId,
            @PathVariable UUID agendaItemId,
            @Valid @RequestBody CreateLivePostRequest request,
            Authentication auth) {
        UUID userId = SecurityUtils.resolveInternalUserId(auth, userRepository);
        LivePostDto dto = liveDiscussionService.createPost(meetingId, agendaItemId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @Transactional(readOnly = true)
    @GetMapping("/agenda/{agendaItemId}/posts")
    public ResponseEntity<List<LivePostDto>> getPosts(
            @PathVariable UUID meetingId,
            @PathVariable UUID agendaItemId) {
        return ResponseEntity.ok(liveDiscussionService.listPosts(meetingId, agendaItemId));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable UUID meetingId) {
        SseEmitter emitter = new SseEmitter(0L);
        sseService.register(meetingId, emitter);
        emitter.onCompletion(() -> sseService.remove(meetingId, emitter));
        emitter.onTimeout(() -> sseService.remove(meetingId, emitter));
        emitter.onError(e -> sseService.remove(meetingId, emitter));
        return emitter;
    }

    @PutMapping("/activate")
    public ResponseEntity<Void> activateLiveSession(@PathVariable UUID meetingId) {
        liveDiscussionService.activateLiveSession(meetingId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/agenda/{agendaItemId}/lock")
    public ResponseEntity<Void> lockDiscussion(
            @PathVariable UUID meetingId,
            @PathVariable UUID agendaItemId,
            Authentication auth) {
        UUID userId = SecurityUtils.resolveInternalUserId(auth, userRepository);
        liveDiscussionService.lockDiscussion(meetingId, agendaItemId, userId);
        return ResponseEntity.ok().build();
    }
}
