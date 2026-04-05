package in.gov.dgs.isep.meeting.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.gov.dgs.isep.meeting.web.LivePostDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LiveMeetingSseService {

    private static final Logger log = LoggerFactory.getLogger(LiveMeetingSseService.class);

    private final Map<UUID, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public LiveMeetingSseService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void register(UUID meetingId, SseEmitter emitter) {
        emitters.computeIfAbsent(meetingId, k -> ConcurrentHashMap.newKeySet()).add(emitter);
        log.debug("SSE client registered for meeting {}", meetingId);
    }

    public void remove(UUID meetingId, SseEmitter emitter) {
        Set<SseEmitter> set = emitters.get(meetingId);
        if (set != null) {
            set.remove(emitter);
            if (set.isEmpty()) {
                emitters.remove(meetingId, set);
            }
        }
    }

    public void publish(UUID meetingId, LivePostDto dto) {
        Set<SseEmitter> set = emitters.get(meetingId);
        if (set == null || set.isEmpty()) {
            return;
        }
        String json;
        try {
            json = objectMapper.writeValueAsString(dto);
        } catch (JsonProcessingException e) {
            log.warn("SSE publish skip: cannot serialize post {}", dto.postId(), e);
            return;
        }
        Set<SseEmitter> dead = ConcurrentHashMap.newKeySet();
        for (SseEmitter emitter : set) {
            try {
                emitter.send(SseEmitter.event().name("new-post").data(json, MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                dead.add(emitter);
            }
        }
        set.removeAll(dead);
    }
}
