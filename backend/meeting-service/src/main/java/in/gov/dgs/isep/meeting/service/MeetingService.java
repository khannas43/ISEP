package in.gov.dgs.isep.meeting.service;

/**
 * Business logic for meetings: CRUD, participants, agenda items, tasks, document list/upload,
 * correspondence group assignment (get with assigned flag, set linked CGs). Creates notifications
 * when tasks are created or reassigned. Uses body id or body name fallback for CG lookup.
 */
import in.gov.dgs.isep.meeting.domain.AgendaItem;
import in.gov.dgs.isep.meeting.domain.CorrespondenceGroup;
import in.gov.dgs.isep.meeting.domain.InternationalBody;
import in.gov.dgs.isep.meeting.domain.Meeting;
import in.gov.dgs.isep.meeting.domain.MeetingCorrespondenceGroup;
import in.gov.dgs.isep.meeting.domain.MeetingParticipant;
import in.gov.dgs.isep.meeting.domain.Task;
import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.domain.Meeting.MeetingStatus;
import in.gov.dgs.isep.meeting.domain.Meeting.MeetingType;
import in.gov.dgs.isep.meeting.repository.AgendaItemRepository;
import in.gov.dgs.isep.meeting.repository.CorrespondenceGroupRepository;
import in.gov.dgs.isep.meeting.repository.InternationalBodyRepository;
import in.gov.dgs.isep.meeting.repository.MeetingCorrespondenceGroupRepository;
import in.gov.dgs.isep.meeting.repository.MeetingParticipantRepository;
import in.gov.dgs.isep.meeting.repository.MeetingRepository;
import in.gov.dgs.isep.meeting.repository.TaskRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.web.AddParticipantRequest;
import in.gov.dgs.isep.meeting.web.AgendaItemDto;
import in.gov.dgs.isep.meeting.web.CreateAgendaItemRequest;
import in.gov.dgs.isep.meeting.web.CreateMeetingRequest;
import in.gov.dgs.isep.meeting.web.CreateTaskRequest;
import in.gov.dgs.isep.meeting.web.MeetingDto;
import in.gov.dgs.isep.meeting.web.TaskDto;
import in.gov.dgs.isep.meeting.web.UpdateAgendaItemRequest;
import in.gov.dgs.isep.meeting.web.UpdateMeetingRequest;
import in.gov.dgs.isep.meeting.web.CorrespondenceGroupWithAssignedDto;
import in.gov.dgs.isep.meeting.web.UpdateTaskRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    // --- Injected repositories and services ---
    private final MeetingRepository meetingRepository;
    private final InternationalBodyRepository bodyRepository;
    private final UserRepository userRepository;
    private final MeetingParticipantRepository participantRepository;
    private final AgendaItemRepository agendaItemRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;
    private final CorrespondenceGroupRepository correspondenceGroupRepository;
    private final MeetingCorrespondenceGroupRepository meetingCorrespondenceGroupRepository;

    public MeetingService(MeetingRepository meetingRepository, InternationalBodyRepository bodyRepository,
                          UserRepository userRepository, MeetingParticipantRepository participantRepository,
                          AgendaItemRepository agendaItemRepository, TaskRepository taskRepository,
                          NotificationService notificationService,
                          CorrespondenceGroupRepository correspondenceGroupRepository,
                          MeetingCorrespondenceGroupRepository meetingCorrespondenceGroupRepository) {
        this.meetingRepository = meetingRepository;
        this.bodyRepository = bodyRepository;
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
        this.agendaItemRepository = agendaItemRepository;
        this.taskRepository = taskRepository;
        this.notificationService = notificationService;
        this.correspondenceGroupRepository = correspondenceGroupRepository;
        this.meetingCorrespondenceGroupRepository = meetingCorrespondenceGroupRepository;
    }

    @Transactional(readOnly = true)
    public List<MeetingDto> getUpcomingMeetings(int limit) {
        int cap = Math.min(Math.max(limit, 1), 100);
        LocalDate today = LocalDate.now();
        return meetingRepository.findUpcomingFrom(today, PageRequest.of(0, cap)).stream()
                .map(MeetingDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<MeetingDto> findAll(Pageable pageable) {
        return meetingRepository.findAll(pageable).map(MeetingDto::from);
    }

    @Transactional(readOnly = true)
    public Page<MeetingDto> findByBodyId(UUID bodyId, Pageable pageable) {
        return meetingRepository.findByBodyBodyId(bodyId, pageable).map(MeetingDto::from);
    }

    @Transactional(readOnly = true)
    public Page<MeetingDto> findByStatus(MeetingStatus status, Pageable pageable) {
        return meetingRepository.findByStatus(status, pageable).map(MeetingDto::from);
    }

    @Transactional(readOnly = true)
    public Page<MeetingDto> searchByTitleOrSessionNumber(String q, Pageable pageable) {
        if (q == null || q.isBlank()) return meetingRepository.findAll(pageable).map(MeetingDto::from);
        return meetingRepository.searchByTitleOrSessionNumber(q.trim(), pageable).map(MeetingDto::from);
    }

    @Transactional(readOnly = true)
    public MeetingDto findById(UUID id) {
        Meeting m = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + id));
        return MeetingDto.from(m);
    }

    @Transactional
    public MeetingDto create(CreateMeetingRequest req, UUID createdBy) {
        // createdBy may be null if JWT sub is not a user UUID (e.g. Keycloak internal id)
        InternationalBody body = bodyRepository.findById(req.getBodyId())
                .orElseThrow(() -> new RuntimeException("Body not found: " + req.getBodyId()));
        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new IllegalArgumentException("endDate must be >= startDate");
        }
        Meeting meeting = new Meeting();
        meeting.setBody(body);
        meeting.setSessionNumber(req.getSessionNumber());
        meeting.setTitle(req.getTitle());
        meeting.setStartDate(req.getStartDate());
        meeting.setEndDate(req.getEndDate());
        meeting.setLocation(req.getLocation());
        meeting.setMeetingType(MeetingType.valueOf(req.getMeetingType()));
        meeting.setStatus(MeetingStatus.PLANNED);
        meeting.setNotes(req.getNotes());
        // created_by must reference core.users; if JWT sub is not in users (e.g. Keycloak id), use null
        UUID effectiveCreatedBy = (createdBy != null && userRepository.existsById(createdBy)) ? createdBy : null;
        meeting.setCreatedBy(effectiveCreatedBy);
        meeting = meetingRepository.save(meeting);
        return MeetingDto.from(meeting);
    }

    @Transactional
    public MeetingDto update(UUID id, UpdateMeetingRequest req) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + id));
        if (req.getBodyId() != null) {
            InternationalBody body = bodyRepository.findById(req.getBodyId())
                    .orElseThrow(() -> new RuntimeException("Body not found: " + req.getBodyId()));
            meeting.setBody(body);
        }
        if (req.getSessionNumber() != null) meeting.setSessionNumber(req.getSessionNumber());
        if (req.getTitle() != null && !req.getTitle().isBlank()) meeting.setTitle(req.getTitle().trim());
        if (req.getStartDate() != null) meeting.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) {
            if (meeting.getStartDate() != null && req.getEndDate().isBefore(meeting.getStartDate())) {
                throw new IllegalArgumentException("endDate must be >= startDate");
            }
            meeting.setEndDate(req.getEndDate());
        }
        if (req.getLocation() != null) meeting.setLocation(req.getLocation());
        if (req.getMeetingType() != null) meeting.setMeetingType(MeetingType.valueOf(req.getMeetingType().toUpperCase()));
        if (req.getNotes() != null) meeting.setNotes(req.getNotes());
        meeting = meetingRepository.save(meeting);
        return MeetingDto.from(meeting);
    }

    @Transactional
    public void updateStatus(UUID id, MeetingStatus status, String cancellationReason) {
        Meeting m = meetingRepository.findById(id).orElseThrow(() -> new RuntimeException("Meeting not found: " + id));
        m.setStatus(status);
        if (status == MeetingStatus.CANCELLED && cancellationReason != null) {
            m.setCancellationReason(cancellationReason);
        }
        meetingRepository.save(m);
    }

    @Transactional
    public void addParticipant(UUID meetingId, AddParticipantRequest req) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + req.getUserId()));
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new IllegalArgumentException("User is not active");
        }
        if (participantRepository.existsByMeetingMeetingIdAndUserUserId(meetingId, req.getUserId())) {
            throw new IllegalArgumentException("User is already a participant");
        }
        MeetingParticipant p = new MeetingParticipant();
        p.setMeeting(meeting);
        p.setUser(user);
        p.setMeetingRole(req.getMeetingRole());
        p.setAssignedAt(java.time.Instant.now());
        participantRepository.save(p);
    }

    @Transactional
    public void removeParticipant(UUID meetingId, UUID participantId) {
        MeetingParticipant p = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found: " + participantId));
        if (!p.getMeeting().getMeetingId().equals(meetingId)) {
            throw new RuntimeException("Participant does not belong to this meeting");
        }
        participantRepository.delete(p);
    }

    @Transactional
    public void updateParticipantRole(UUID meetingId, UUID participantId, String meetingRole) {
        MeetingParticipant p = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found: " + participantId));
        if (!p.getMeeting().getMeetingId().equals(meetingId)) {
            throw new RuntimeException("Participant does not belong to this meeting");
        }
        p.setMeetingRole(meetingRole);
        participantRepository.save(p);
    }

    @Transactional(readOnly = true)
    public AgendaItemDto getAgendaItem(UUID meetingId, UUID agendaItemId) {
        AgendaItem item = agendaItemRepository.findById(agendaItemId)
                .orElseThrow(() -> new RuntimeException("Agenda item not found: " + agendaItemId));
        if (!item.getMeeting().getMeetingId().equals(meetingId)) {
            throw new RuntimeException("Agenda item does not belong to this meeting");
        }
        return AgendaItemDto.from(item);
    }

    @Transactional
    public AgendaItemDto createAgendaItem(UUID meetingId, CreateAgendaItemRequest req) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));
        AgendaItem item = new AgendaItem();
        item.setMeeting(meeting);
        item.setItemNumber(req.getItemNumber());
        item.setTitle(req.getTitle() != null ? req.getTitle().trim() : "");
        item.setDescription(req.getDescription());
        item.setCategory(req.getCategory());
        item.setPriority(req.getPriority());
        item.setStatus(req.getStatus() != null && !req.getStatus().isBlank() ? req.getStatus() : "DRAFT");
        item.setDeadlineForInputs(req.getDeadlineForInputs());
        if (req.getAssignedCoordinatorId() != null && userRepository.existsById(req.getAssignedCoordinatorId())) {
            item.setAssignedCoordinator(userRepository.getReferenceById(req.getAssignedCoordinatorId()));
        }
        item = agendaItemRepository.save(item);
        return AgendaItemDto.from(item);
    }

    @Transactional
    public AgendaItemDto updateAgendaItem(UUID meetingId, UUID agendaItemId, UpdateAgendaItemRequest req) {
        AgendaItem item = agendaItemRepository.findById(agendaItemId)
                .orElseThrow(() -> new RuntimeException("Agenda item not found: " + agendaItemId));
        if (!item.getMeeting().getMeetingId().equals(meetingId)) {
            throw new RuntimeException("Agenda item does not belong to this meeting");
        }
        if (req.getItemNumber() != null) item.setItemNumber(req.getItemNumber());
        if (req.getTitle() != null && !req.getTitle().isBlank()) item.setTitle(req.getTitle().trim());
        if (req.getDescription() != null) item.setDescription(req.getDescription());
        if (req.getCategory() != null) item.setCategory(req.getCategory());
        if (req.getPriority() != null) item.setPriority(req.getPriority());
        if (req.getStatus() != null && !req.getStatus().isBlank()) item.setStatus(req.getStatus());
        if (req.getDeadlineForInputs() != null) item.setDeadlineForInputs(req.getDeadlineForInputs());
        if (req.getAssignedCoordinatorId() != null) {
            if (userRepository.existsById(req.getAssignedCoordinatorId())) {
                item.setAssignedCoordinator(userRepository.getReferenceById(req.getAssignedCoordinatorId()));
            }
        }
        item = agendaItemRepository.save(item);
        return AgendaItemDto.from(item);
    }

    @Transactional(readOnly = true)
    public TaskDto getTask(UUID meetingId, UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        if (task.getMeeting() == null || !task.getMeeting().getMeetingId().equals(meetingId)) {
            throw new RuntimeException("Task does not belong to this meeting");
        }
        return TaskDto.from(task);
    }

    @Transactional
    public TaskDto createTask(UUID meetingId, CreateTaskRequest req, UUID assignedByUserId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));
        User assignedTo = userRepository.findById(req.getAssignedToId())
                .orElseThrow(() -> new RuntimeException("User not found: " + req.getAssignedToId()));
        User assignedBy = assignedByUserId != null && userRepository.existsById(assignedByUserId)
                ? userRepository.getReferenceById(assignedByUserId)
                : assignedTo;
        Task task = new Task();
        task.setMeeting(meeting);
        task.setTitle(req.getTitle().trim());
        task.setDescription(req.getDescription());
        task.setAssignedTo(assignedTo);
        task.setAssignedBy(assignedBy);
        task.setPriority(req.getPriority() != null && !req.getPriority().isBlank() ? req.getPriority() : "MEDIUM");
        task.setDueDate(req.getDueDate());
        task.setStatus(req.getStatus() != null && !req.getStatus().isBlank() ? req.getStatus() : "PENDING");
        task = taskRepository.save(task);
        try {
            notificationService.create(
                    assignedTo.getUserId(),
                    "TASK_ASSIGNED",
                    "Task assigned",
                    "You were assigned the task: \"" + task.getTitle() + "\".",
                    "task",
                    task.getTaskId().toString()
            );
        } catch (Exception e) {
            // Do not fail task creation if notification fails
        }
        return TaskDto.from(task);
    }

    @Transactional
    public TaskDto updateTask(UUID meetingId, UUID taskId, UpdateTaskRequest req) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        if (task.getMeeting() == null || !task.getMeeting().getMeetingId().equals(meetingId)) {
            throw new RuntimeException("Task does not belong to this meeting");
        }
        UUID previousAssignedToId = task.getAssignedTo() != null ? task.getAssignedTo().getUserId() : null;
        if (req.getTitle() != null && !req.getTitle().isBlank()) task.setTitle(req.getTitle().trim());
        if (req.getDescription() != null) task.setDescription(req.getDescription());
        if (req.getAssignedToId() != null && userRepository.existsById(req.getAssignedToId())) {
            task.setAssignedTo(userRepository.getReferenceById(req.getAssignedToId()));
        }
        if (req.getPriority() != null && !req.getPriority().isBlank()) task.setPriority(req.getPriority());
        if (req.getDueDate() != null) task.setDueDate(req.getDueDate());
        if (req.getStatus() != null && !req.getStatus().isBlank()) task.setStatus(req.getStatus());
        task = taskRepository.save(task);
        if (req.getAssignedToId() != null && !req.getAssignedToId().equals(previousAssignedToId)) {
            try {
                notificationService.create(
                        task.getAssignedTo().getUserId(),
                        "TASK_ASSIGNED",
                        "Task assigned",
                        "You were assigned the task: \"" + task.getTitle() + "\".",
                        "task",
                        task.getTaskId().toString()
                );
            } catch (Exception e) {
                // Do not fail task update if notification fails
            }
        }
        return TaskDto.from(task);
    }

    /** All CGs for the meeting's body with assigned flag (for picker UI). Uses body name as fallback if no CGs found by body ID. */
    @Transactional(readOnly = true)
    public List<CorrespondenceGroupWithAssignedDto> getCorrespondenceGroupsWithAssigned(UUID meetingId) {
        Meeting meeting = meetingRepository.findByIdWithBody(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));
        if (meeting.getBody() == null) {
            return List.of();
        }
        UUID bodyId = meeting.getBody().getBodyId();
        String bodyName = meeting.getBody().getName();
        Set<UUID> assignedCgIds = meetingCorrespondenceGroupRepository.findByMeetingMeetingId(meetingId)
                .stream()
                .map(mcg -> mcg.getCorrespondenceGroup().getCgId())
                .collect(Collectors.toSet());
        List<CorrespondenceGroup> cgs = correspondenceGroupRepository.findByParentBodyBodyIdOrderByNameAsc(bodyId);
        if (cgs.isEmpty() && bodyName != null && !bodyName.isBlank()) {
            cgs = correspondenceGroupRepository.findByParentBodyNameOrderByNameAsc(bodyName.trim());
        }
        return cgs.stream()
                .map(cg -> CorrespondenceGroupWithAssignedDto.from(cg, assignedCgIds.contains(cg.getCgId())))
                .collect(Collectors.toList());
    }

    /** Set which CGs are assigned to the meeting (only CGs for the meeting's body). Uses body name as fallback when resolving CGs. */
    @Transactional
    public void setMeetingCorrespondenceGroups(UUID meetingId, List<UUID> cgIds) {
        Meeting meeting = meetingRepository.findByIdWithBody(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));
        if (meeting.getBody() == null) {
            throw new RuntimeException("Meeting has no body");
        }
        UUID bodyId = meeting.getBody().getBodyId();
        String bodyName = meeting.getBody().getName();
        List<CorrespondenceGroup> bodyCgs = correspondenceGroupRepository.findByParentBodyBodyIdOrderByNameAsc(bodyId);
        if (bodyCgs.isEmpty() && bodyName != null && !bodyName.isBlank()) {
            bodyCgs = correspondenceGroupRepository.findByParentBodyNameOrderByNameAsc(bodyName.trim());
        }
        Set<UUID> validCgIds = bodyCgs.stream().map(CorrespondenceGroup::getCgId).collect(Collectors.toSet());
        List<UUID> toAssign = cgIds != null ? cgIds.stream().filter(validCgIds::contains).distinct().collect(Collectors.toList()) : List.of();

        meetingCorrespondenceGroupRepository.deleteByMeetingMeetingId(meetingId);
        for (UUID cgId : toAssign) {
            CorrespondenceGroup cg = bodyCgs.stream().filter(c -> c.getCgId().equals(cgId)).findFirst().orElseThrow();
            MeetingCorrespondenceGroup link = new MeetingCorrespondenceGroup();
            link.setMeeting(meeting);
            link.setCorrespondenceGroup(cg);
            meetingCorrespondenceGroupRepository.save(link);
        }
    }
}
