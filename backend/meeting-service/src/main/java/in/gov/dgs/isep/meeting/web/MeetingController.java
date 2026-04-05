package in.gov.dgs.isep.meeting.web;

/**
 * REST controller for meetings and related sub-resources.
 * Base path: /api/v1/meetings
 * Handles: list (with bodyId/status/q), get, create, update, status; participants; agenda items;
 * tasks; documents list/upload; correspondence groups (get with assigned flag, put to set);
 * interventions and outcomes (live meeting). All mutations require JWT (Bearer).
 */
import in.gov.dgs.isep.meeting.domain.Meeting.MeetingStatus;
import in.gov.dgs.isep.meeting.repository.AgendaItemRepository;
import in.gov.dgs.isep.meeting.repository.DocumentRepository;
import in.gov.dgs.isep.meeting.repository.MeetingParticipantRepository;
import in.gov.dgs.isep.meeting.repository.MeetingStatusHistoryRepository;
import in.gov.dgs.isep.meeting.repository.TaskRepository;
import in.gov.dgs.isep.meeting.service.DocumentService;
import in.gov.dgs.isep.meeting.service.FeedbackArchiveService;
import in.gov.dgs.isep.meeting.service.LiveMeetingService;
import in.gov.dgs.isep.meeting.service.MeetingService;
import in.gov.dgs.isep.meeting.web.AddParticipantRequest;
import in.gov.dgs.isep.meeting.web.AgendaItemDto;
import in.gov.dgs.isep.meeting.web.CorrespondenceGroupWithAssignedDto;
import in.gov.dgs.isep.meeting.web.DocumentDto;
import in.gov.dgs.isep.meeting.web.CreateAgendaItemRequest;
import in.gov.dgs.isep.meeting.web.CreateTaskRequest;
import in.gov.dgs.isep.meeting.web.MeetingStatusHistoryDto;
import in.gov.dgs.isep.meeting.web.TaskDto;
import in.gov.dgs.isep.meeting.web.UpdateAgendaItemRequest;
import in.gov.dgs.isep.meeting.web.UpdateTaskRequest;
import in.gov.dgs.isep.meeting.web.CreateInterventionRequest;
import in.gov.dgs.isep.meeting.web.CreateOutcomeRequest;
import in.gov.dgs.isep.meeting.web.FeedbackArchivePageDto;
import in.gov.dgs.isep.meeting.web.InterventionDto;
import in.gov.dgs.isep.meeting.web.OutcomeDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/meetings")
public class MeetingController {

    // --- Dependencies (injected by Spring) ---

    private final MeetingService meetingService;
    private final MeetingParticipantRepository participantRepository;
    private final AgendaItemRepository agendaItemRepository;
    private final MeetingStatusHistoryRepository statusHistoryRepository;
    private final TaskRepository taskRepository;
    private final DocumentRepository documentRepository;
    private final DocumentService documentService;
    private final LiveMeetingService liveMeetingService;
    private final FeedbackArchiveService feedbackArchiveService;

    public MeetingController(MeetingService meetingService,
                             MeetingParticipantRepository participantRepository,
                             AgendaItemRepository agendaItemRepository,
                             MeetingStatusHistoryRepository statusHistoryRepository,
                             TaskRepository taskRepository,
                             DocumentRepository documentRepository,
                             DocumentService documentService,
                             LiveMeetingService liveMeetingService,
                             FeedbackArchiveService feedbackArchiveService) {
        this.meetingService = meetingService;
        this.participantRepository = participantRepository;
        this.agendaItemRepository = agendaItemRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.taskRepository = taskRepository;
        this.documentRepository = documentRepository;
        this.documentService = documentService;
        this.liveMeetingService = liveMeetingService;
        this.feedbackArchiveService = feedbackArchiveService;
    }

    /** Paginated list; optional filters: bodyId, status, or q (search by title/session number). */
    /** When {@code upcoming=true}, returns {@code { "data": [...] }} (non-paginated, next meetings from today). */
    @GetMapping
    public Object list(
            @RequestParam(defaultValue = "false") boolean upcoming,
            @RequestParam(defaultValue = "30") int limit,
            @RequestParam(required = false) UUID bodyId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        if (upcoming) {
            return Map.of("data", meetingService.getUpcomingMeetings(limit));
        }
        if (q != null && !q.isBlank()) {
            return meetingService.searchByTitleOrSessionNumber(q, pageable);
        }
        if (bodyId != null) {
            return meetingService.findByBodyId(bodyId, pageable);
        }
        if (status != null && !status.isBlank()) {
            return meetingService.findByStatus(MeetingStatus.valueOf(status.toUpperCase()), pageable);
        }
        return meetingService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingDto> get(@PathVariable UUID id) {
        return ResponseEntity.ok(meetingService.findById(id));
    }

    /** SCR-COL — historical feedback for a meeting (collaboration.feedback; consolidation reserved). */
    @Transactional(readOnly = true)
    @GetMapping("/{meetingId}/feedback/archive")
    public ResponseEntity<FeedbackArchivePageDto> feedbackArchive(
            @PathVariable UUID meetingId,
            @RequestParam(required = false) UUID agendaItemId,
            @RequestParam(required = false) UUID submittedBy,
            @RequestParam(required = false) String position,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(feedbackArchiveService.list(meetingId, agendaItemId, submittedBy, position, pageable));
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/participants")
    public ResponseEntity<List<MeetingParticipantDto>> getParticipants(@PathVariable UUID id) {
        List<MeetingParticipantDto> list = participantRepository.findByMeetingMeetingIdOrderByAssignedAtAsc(id)
                .stream().map(MeetingParticipantDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/agenda-items")
    public ResponseEntity<List<AgendaItemDto>> getAgendaItems(@PathVariable UUID id) {
        List<AgendaItemDto> list = agendaItemRepository.findByMeetingMeetingIdOrderByItemNumberAsc(id)
                .stream().map(AgendaItemDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/agenda-items/{itemId}")
    public ResponseEntity<AgendaItemDto> getAgendaItem(@PathVariable UUID id, @PathVariable UUID itemId) {
        return ResponseEntity.ok(meetingService.getAgendaItem(id, itemId));
    }

    @PostMapping("/{id}/agenda-items")
    public ResponseEntity<AgendaItemDto> createAgendaItem(
            @PathVariable UUID id,
            @Valid @RequestBody CreateAgendaItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(meetingService.createAgendaItem(id, request));
    }

    @PatchMapping("/{id}/agenda-items/{itemId}")
    public ResponseEntity<AgendaItemDto> updateAgendaItem(
            @PathVariable UUID id,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateAgendaItemRequest request
    ) {
        return ResponseEntity.ok(meetingService.updateAgendaItem(id, itemId, request));
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/status-history")
    public ResponseEntity<List<MeetingStatusHistoryDto>> getStatusHistory(@PathVariable UUID id) {
        List<MeetingStatusHistoryDto> list = statusHistoryRepository.findByMeetingMeetingIdOrderByChangedAtDesc(id)
                .stream().map(MeetingStatusHistoryDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<TaskDto>> getTasks(@PathVariable UUID id) {
        List<TaskDto> list = taskRepository.findByMeetingMeetingIdOrderByDueDateAsc(id)
                .stream().map(TaskDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/documents")
    public ResponseEntity<List<DocumentDto>> getDocuments(@PathVariable UUID id) {
        List<DocumentDto> list = documentRepository.findByMeetingMeetingIdOrderByUploadedAtDesc(id)
                .stream().map(DocumentDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<DocumentDto> uploadDocument(
            @PathVariable UUID id,
            @RequestParam String title,
            @RequestParam(required = false) String documentType,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) UUID agendaItemId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID uploadedBy = parseUserId(jwt != null ? jwt.getSubject() : null);
        if (uploadedBy == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(documentService.createDocument(id, title, documentType, source, agendaItemId, uploadedBy, file));
        } catch (java.io.IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/correspondence-groups")
    public ResponseEntity<List<CorrespondenceGroupWithAssignedDto>> getCorrespondenceGroups(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(meetingService.getCorrespondenceGroupsWithAssigned(id));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    /** Set which correspondence groups are linked to this meeting (only CGs for the meeting's body). */
    @PutMapping("/{id}/correspondence-groups")
    public ResponseEntity<Void> setCorrespondenceGroups(@PathVariable UUID id, @RequestBody List<UUID> cgIds) {
        try {
            meetingService.setMeetingCorrespondenceGroups(id, cgIds != null ? cgIds : List.of());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @PostMapping
    public ResponseEntity<MeetingDto> create(
            @Valid @RequestBody CreateMeetingRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID createdBy = parseUserId(jwt != null ? jwt.getSubject() : null);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(meetingService.create(request, createdBy));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private static UUID parseUserId(String sub) {
        if (sub == null || sub.isBlank()) return null;
        try {
            if (sub.length() == 32 && !sub.contains("-")) {
                return UUID.fromString(sub.replaceFirst("(\\w{8})(\\w{4})(\\w{4})(\\w{4})(\\w{12})", "$1-$2-$3-$4-$5"));
            }
            return UUID.fromString(sub);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MeetingDto> update(
            @PathVariable UUID id,
            @RequestBody UpdateMeetingRequest request
    ) {
        try {
            return ResponseEntity.ok(meetingService.update(id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) String cancellationReason
    ) {
        try {
            meetingService.updateStatus(id, MeetingStatus.valueOf(status.toUpperCase()), cancellationReason);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/participants")
    public ResponseEntity<Void> addParticipant(
            @PathVariable UUID id,
            @Valid @RequestBody AddParticipantRequest request
    ) {
        try {
            meetingService.addParticipant(id, request);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @DeleteMapping("/{id}/participants/{participantId}")
    public ResponseEntity<Void> removeParticipant(
            @PathVariable UUID id,
            @PathVariable UUID participantId
    ) {
        try {
            meetingService.removeParticipant(id, participantId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @PatchMapping("/{id}/participants/{participantId}")
    public ResponseEntity<Void> updateParticipantRole(
            @PathVariable UUID id,
            @PathVariable UUID participantId,
            @RequestBody java.util.Map<String, String> body
    ) {
        String meetingRole = body != null ? body.get("meetingRole") : null;
        if (meetingRole == null || meetingRole.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            meetingService.updateParticipantRole(id, participantId, meetingRole);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/tasks/{taskId}")
    public ResponseEntity<TaskDto> getTask(@PathVariable UUID id, @PathVariable UUID taskId) {
        try {
            return ResponseEntity.ok(meetingService.getTask(id, taskId));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @PostMapping("/{id}/tasks")
    public ResponseEntity<TaskDto> createTask(
            @PathVariable UUID id,
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID assignedBy = parseUserId(jwt != null ? jwt.getSubject() : null);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(meetingService.createTask(id, request, assignedBy));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @PatchMapping("/{id}/tasks/{taskId}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable UUID id,
            @PathVariable UUID taskId,
            @RequestBody UpdateTaskRequest request
    ) {
        try {
            return ResponseEntity.ok(meetingService.updateTask(id, taskId, request));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/interventions")
    public ResponseEntity<List<InterventionDto>> getInterventions(@PathVariable UUID id) {
        if (meetingService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(liveMeetingService.listInterventions(id));
    }

    @PostMapping("/{id}/interventions")
    public ResponseEntity<InterventionDto> createIntervention(
            @PathVariable UUID id,
            @Valid @RequestBody CreateInterventionRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(liveMeetingService.createIntervention(id, request, userId));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/outcomes")
    public ResponseEntity<List<OutcomeDto>> getOutcomes(@PathVariable UUID id) {
        if (meetingService.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(liveMeetingService.listOutcomes(id));
    }

    @PostMapping("/{id}/outcomes")
    public ResponseEntity<OutcomeDto> createOutcome(
            @PathVariable UUID id,
            @Valid @RequestBody CreateOutcomeRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(liveMeetingService.createOutcome(id, request, userId));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }
}
