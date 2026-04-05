package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.AgendaItem;
import in.gov.dgs.isep.meeting.domain.Meeting;
import in.gov.dgs.isep.meeting.domain.MeetingParticipant;
import in.gov.dgs.isep.meeting.domain.Task;
import in.gov.dgs.isep.meeting.domain.TaskAssignee;
import in.gov.dgs.isep.meeting.domain.TaskAssigneeId;
import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.repository.AgendaItemRepository;
import in.gov.dgs.isep.meeting.repository.DocumentRepository;
import in.gov.dgs.isep.meeting.repository.MeetingParticipantRepository;
import in.gov.dgs.isep.meeting.repository.MeetingRepository;
import in.gov.dgs.isep.meeting.repository.TaskAssigneeRepository;
import in.gov.dgs.isep.meeting.repository.TaskRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.web.CreateTaskApiRequest;
import in.gov.dgs.isep.meeting.web.TaskResponse;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskApiService {

    private static final Set<String> ASSIGNABLE_ROLES = Set.of("MEMBER", "COORDINATOR");

    private final MeetingRepository meetingRepository;
    private final AgendaItemRepository agendaItemRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final TaskAssigneeRepository taskAssigneeRepository;
    private final MeetingParticipantRepository participantRepository;
    private final DocumentRepository documentRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public TaskApiService(
            MeetingRepository meetingRepository,
            AgendaItemRepository agendaItemRepository,
            UserRepository userRepository,
            TaskRepository taskRepository,
            TaskAssigneeRepository taskAssigneeRepository,
            MeetingParticipantRepository participantRepository,
            DocumentRepository documentRepository,
            NotificationService notificationService,
            AuditService auditService) {
        this.meetingRepository = meetingRepository;
        this.agendaItemRepository = agendaItemRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.taskAssigneeRepository = taskAssigneeRepository;
        this.participantRepository = participantRepository;
        this.documentRepository = documentRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public TaskResponse create(CreateTaskApiRequest req, String jwtSubject, String preferredUsername) {
        UUID createdByUserId = userRepository.resolveJwtSubjectToUserId(jwtSubject, preferredUsername)
                .orElse(null);
        if (createdByUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User id required");
        }
        UUID meetingId = req.getMeetingId();
        UUID agendaItemId = req.getAgendaItemId();
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting not found"));
        AgendaItem agendaItem = agendaItemRepository.findById(agendaItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agenda item not found"));
        if (!agendaItem.getMeeting().getMeetingId().equals(meetingId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Agenda item does not belong to meeting");
        }
        String priority = req.getPriority() != null ? req.getPriority().trim().toUpperCase(Locale.ROOT) : "MEDIUM";
        if (!Set.of("HIGH", "MEDIUM", "LOW").contains(priority)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid priority");
        }
        List<UUID> assigneeIds = req.getAssignedTo().stream().distinct().toList();
        if (assigneeIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one assignee required");
        }
        for (UUID uid : assigneeIds) {
            MeetingParticipant mp = participantRepository.findByMeetingMeetingIdAndUserUserId(meetingId, uid)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a meeting participant: " + uid));
            String role = mp.getMeetingRole();
            if (role == null || ASSIGNABLE_ROLES.stream().noneMatch(r -> r.equalsIgnoreCase(role))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User cannot be assigned (role must be MEMBER or COORDINATOR): " + uid);
            }
            if (!userRepository.existsById(uid)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found: " + uid);
            }
        }
        if (req.getDocumentId() != null) {
            documentRepository.findByDocumentIdAndAgendaItem_AgendaItemId(req.getDocumentId(), agendaItemId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document does not belong to this agenda item"));
        }
        User firstAssignee = userRepository.getReferenceById(assigneeIds.get(0));
        User assignedBy = userRepository.getReferenceById(createdByUserId);
        User createdBy = userRepository.getReferenceById(createdByUserId);

        Task task = new Task();
        task.setMeeting(meeting);
        task.setAgendaItem(agendaItem);
        if (req.getDocumentId() != null) {
            task.setDocument(documentRepository.getReferenceById(req.getDocumentId()));
        }
        task.setTitle(req.getTitle().trim());
        task.setDescription(req.getDescription());
        task.setAssignedTo(firstAssignee);
        task.setAssignedBy(assignedBy);
        task.setCreatedBy(createdBy);
        task.setPriority(priority);
        LocalDate due = req.getDueDate();
        task.setDueDate(due.atStartOfDay(ZoneOffset.UTC).toInstant());
        task.setStatus("PENDING");
        task = taskRepository.save(task);

        for (UUID uid : assigneeIds) {
            TaskAssignee ta = new TaskAssignee();
            ta.setId(new TaskAssigneeId(task.getTaskId(), uid));
            ta.setAssignedAt(Instant.now());
            taskAssigneeRepository.save(ta);
        }

        String dueStr = due.format(DateTimeFormatter.ISO_LOCAL_DATE);
        for (UUID uid : assigneeIds) {
            try {
                notificationService.create(
                        uid,
                        "TASK_ASSIGNED",
                        "Task assigned",
                        "You have been assigned a task: \"" + task.getTitle() + "\" — due " + dueStr,
                        "task",
                        task.getTaskId().toString()
                );
            } catch (Exception ignored) {
                // non-fatal
            }
        }

        try {
            auditService.log(
                    createdByUserId,
                    null,
                    "CREATE",
                    "Task",
                    task.getTaskId(),
                    null,
                    null,
                    null,
                    "SUCCESS",
                    Map.of(
                            "meetingId", meetingId.toString(),
                            "agendaItemId", agendaItemId.toString(),
                            "title", task.getTitle()
                    )
            );
        } catch (Exception ignored) {
            // non-fatal
        }

        return toResponse(task, loadAssigneeIds(task));
    }

    @Transactional(readOnly = true)
    public Object listMy(UUID userId, String statusCsv, UUID meetingIdFilter, Boolean countOnly) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        List<Task> tasks = taskRepository.findAllForAssignee(userId);
        if (meetingIdFilter != null) {
            tasks = tasks.stream().filter(t -> t.getMeeting() != null && meetingIdFilter.equals(t.getMeeting().getMeetingId())).toList();
        }
        if (statusCsv != null && !statusCsv.isBlank()) {
            Set<String> wanted = Set.of(statusCsv.split(",")).stream().map(s -> s.trim().toUpperCase(Locale.ROOT)).collect(Collectors.toSet());
            tasks = tasks.stream().filter(t -> wanted.contains(t.getStatus().toUpperCase(Locale.ROOT))).toList();
        }
        if (Boolean.TRUE.equals(countOnly)) {
            return Map.of("count", (long) tasks.size());
        }
        List<TaskResponse> rows = tasks.stream()
                .map(t -> toResponse(t, loadAssigneeIds(t)))
                .sorted(Comparator
                        .comparing((TaskResponse r) -> !Boolean.TRUE.equals(r.isOverdue()))
                        .thenComparing(r -> r.dueDate() != null ? r.dueDate() : Instant.EPOCH))
                .toList();
        return rows;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> listTeam(UUID userId, UUID meetingIdFilter, Authentication auth) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        boolean admin = hasAnyRole(auth, "SYSTEM_ADMIN");
        List<Task> tasks;
        if (admin) {
            if (meetingIdFilter != null) {
                tasks = taskRepository.findByMeetingMeetingIdOrderByDueDateAsc(meetingIdFilter);
            } else {
                tasks = taskRepository.findAll();
            }
        } else if (hasAnyRole(auth, "DELEGATION_LEADER", "COORDINATOR")) {
            Set<UUID> meetingIds = participantRepository.findByUserUserId(userId).stream()
                    .filter(p -> {
                        String r = p.getMeetingRole();
                        return r != null && ("COORDINATOR".equalsIgnoreCase(r) || "DELEGATION_LEADER".equalsIgnoreCase(r));
                    })
                    .map(p -> p.getMeeting().getMeetingId())
                    .collect(Collectors.toSet());
            if (meetingIdFilter != null) {
                if (!meetingIds.contains(meetingIdFilter)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed for this meeting");
                }
                meetingIds = Set.of(meetingIdFilter);
            }
            if (meetingIds.isEmpty()) {
                return List.of();
            }
            tasks = taskRepository.findByMeetingMeetingIdInOrderByDueDateAsc(meetingIds);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return tasks.stream().map(t -> toResponse(t, loadAssigneeIds(t))).toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(UUID taskId, UUID userId, Authentication auth) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        if (!canViewTask(task, userId, auth)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return toResponse(task, loadAssigneeIds(task));
    }

    @Transactional(readOnly = true)
    public byte[] exportTeam(UUID userId, UUID meetingIdFilter, String format, Authentication auth) {
        List<TaskResponse> rows = listTeam(userId, meetingIdFilter, auth);
        if ("xml".equalsIgnoreCase(format)) {
            return toXml(rows);
        }
        return toXlsx(rows);
    }

    private List<UUID> loadAssigneeIds(Task t) {
        List<TaskAssignee> rows = taskAssigneeRepository.findById_TaskId(t.getTaskId());
        if (!rows.isEmpty()) {
            return rows.stream().map(r -> r.getId().getUserId()).distinct().toList();
        }
        if (t.getAssignedTo() != null) {
            return List.of(t.getAssignedTo().getUserId());
        }
        return List.of();
    }

    private boolean canViewTask(Task task, UUID userId, Authentication auth) {
        if (userId == null) return false;
        if (hasAnyRole(auth, "SYSTEM_ADMIN")) return true;
        List<UUID> assignees = loadAssigneeIds(task);
        if (assignees.contains(userId)) return true;
        UUID mid = task.getMeeting() != null ? task.getMeeting().getMeetingId() : null;
        if (mid == null) return false;
        if (hasAnyRole(auth, "COORDINATOR", "DELEGATION_LEADER")) {
            return participantRepository.findByMeetingMeetingIdAndUserUserId(mid, userId)
                    .filter(p -> {
                        String r = p.getMeetingRole();
                        return r != null
                                && ("COORDINATOR".equalsIgnoreCase(r) || "DELEGATION_LEADER".equalsIgnoreCase(r));
                    })
                    .isPresent();
        }
        return false;
    }

    private static boolean hasAnyRole(Authentication auth, String... roles) {
        if (auth == null) return false;
        for (String want : roles) {
            String prefixed = "ROLE_" + want.toUpperCase(Locale.ROOT);
            for (GrantedAuthority a : auth.getAuthorities()) {
                if (prefixed.equalsIgnoreCase(a.getAuthority())) {
                    return true;
                }
            }
        }
        return false;
    }

    private TaskResponse toResponse(Task t, List<UUID> assigneeIds) {
        Instant startOfToday = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
        String st = t.getStatus() != null ? t.getStatus().toUpperCase(Locale.ROOT) : "";
        boolean overdue = ("PENDING".equals(st) || "IN_PROGRESS".equals(st))
                && t.getDueDate() != null
                && t.getDueDate().isBefore(startOfToday);
        String meetingTitle = null;
        if (t.getMeeting() != null) {
            meetingTitle = t.getMeeting().getTitle();
        }
        return new TaskResponse(
                t.getTaskId(),
                t.getTitle(),
                t.getDescription(),
                t.getMeeting() != null ? t.getMeeting().getMeetingId() : null,
                t.getAgendaItem() != null ? t.getAgendaItem().getAgendaItemId() : null,
                t.getDocument() != null ? t.getDocument().getDocumentId() : null,
                new ArrayList<>(assigneeIds),
                t.getDueDate(),
                t.getPriority(),
                t.getStatus(),
                t.getCreatedBy() != null ? t.getCreatedBy().getUserId() : null,
                t.getCreatedAt(),
                overdue,
                t.getEscalatedAt(),
                meetingTitle
        );
    }

    private static byte[] toXlsx(List<TaskResponse> rows) {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sh = wb.createSheet("Tasks");
            Row header = sh.createRow(0);
            String[] cols = {"Title", "Agenda Item", "Assigned To", "Due Date", "Priority", "Status", "Escalated At"};
            for (int i = 0; i < cols.length; i++) {
                header.createCell(i).setCellValue(cols[i]);
            }
            int r = 1;
            for (TaskResponse t : rows) {
                Row row = sh.createRow(r++);
                row.createCell(0).setCellValue(t.title());
                row.createCell(1).setCellValue(t.agendaItemId() != null ? t.agendaItemId().toString() : "");
                row.createCell(2).setCellValue(t.assignedTo().stream().map(UUID::toString).collect(Collectors.joining(", ")));
                row.createCell(3).setCellValue(t.dueDate() != null ? t.dueDate().toString() : "");
                row.createCell(4).setCellValue(t.priority());
                row.createCell(5).setCellValue(t.status());
                row.createCell(6).setCellValue(t.escalatedAt() != null ? t.escalatedAt().toString() : "");
            }
            wb.write(bos);
            return bos.toByteArray();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Export failed");
        }
    }

    private static byte[] toXml(List<TaskResponse> rows) {
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<tasks>\n");
        for (TaskResponse t : rows) {
            sb.append("  <task>\n");
            sb.append("    <taskId>").append(escapeXml(t.taskId().toString())).append("</taskId>\n");
            sb.append("    <title>").append(escapeXml(t.title())).append("</title>\n");
            sb.append("    <agendaItemId>").append(t.agendaItemId() != null ? escapeXml(t.agendaItemId().toString()) : "").append("</agendaItemId>\n");
            sb.append("    <dueDate>").append(t.dueDate() != null ? escapeXml(t.dueDate().toString()) : "").append("</dueDate>\n");
            sb.append("    <priority>").append(escapeXml(t.priority())).append("</priority>\n");
            sb.append("    <status>").append(escapeXml(t.status())).append("</status>\n");
            sb.append("    <escalatedAt>").append(t.escalatedAt() != null ? escapeXml(t.escalatedAt().toString()) : "").append("</escalatedAt>\n");
            sb.append("  </task>\n");
        }
        sb.append("</tasks>\n");
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String escapeXml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
