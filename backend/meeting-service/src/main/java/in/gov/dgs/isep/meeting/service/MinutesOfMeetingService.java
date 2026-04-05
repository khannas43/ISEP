package in.gov.dgs.isep.meeting.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import in.gov.dgs.isep.meeting.domain.AgendaItem;
import in.gov.dgs.isep.meeting.domain.Meeting;
import in.gov.dgs.isep.meeting.domain.MeetingParticipant;
import in.gov.dgs.isep.meeting.domain.MinutesOfMeeting;
import in.gov.dgs.isep.meeting.domain.Task;
import in.gov.dgs.isep.meeting.repository.AgendaItemRepository;
import in.gov.dgs.isep.meeting.repository.MeetingParticipantRepository;
import in.gov.dgs.isep.meeting.repository.MeetingRepository;
import in.gov.dgs.isep.meeting.repository.MinutesOfMeetingRepository;
import in.gov.dgs.isep.meeting.repository.TaskRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.web.MinutesOfMeetingDto;
import in.gov.dgs.isep.shared.util.DeviceTypeUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MinutesOfMeetingService {

    private final MeetingRepository meetingRepository;
    private final AgendaItemRepository agendaItemRepository;
    private final TaskRepository taskRepository;
    private final MeetingParticipantRepository participantRepository;
    private final MinutesOfMeetingRepository momRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    public MinutesOfMeetingService(
            MeetingRepository meetingRepository,
            AgendaItemRepository agendaItemRepository,
            TaskRepository taskRepository,
            MeetingParticipantRepository participantRepository,
            MinutesOfMeetingRepository momRepository,
            UserRepository userRepository,
            AuditService auditService,
            ObjectMapper objectMapper) {
        this.meetingRepository = meetingRepository;
        this.agendaItemRepository = agendaItemRepository;
        this.taskRepository = taskRepository;
        this.participantRepository = participantRepository;
        this.momRepository = momRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public MinutesOfMeetingDto generate(UUID meetingId, UUID generatedByUserId, HttpServletRequest request, String userRole) {
        if (generatedByUserId == null) {
            throw new IllegalArgumentException("User not resolved for MoM generation");
        }
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));

        List<AgendaItem> items = agendaItemRepository.findByMeetingMeetingIdOrderByItemNumberAsc(meetingId);
        List<MeetingParticipant> participants = participantRepository.findByMeetingMeetingIdOrderByAssignedAtAsc(meetingId);
        List<Task> tasks = taskRepository.findByMeetingMeetingIdOrderByDueDateAsc(meetingId);
        List<Task> actionItems = tasks.stream()
                .filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus()))
                .collect(Collectors.toList());

        String html = buildMomHtml(meeting, items, participants, actionItems);

        ArrayNode actionJson = objectMapper.createArrayNode();
        for (Task t : actionItems) {
            ObjectNode o = objectMapper.createObjectNode();
            o.put("task", t.getTitle());
            o.put("assignee", t.getAssignedTo() != null ? t.getAssignedTo().getFullName() : "");
            o.put("dueDate", t.getDueDate() != null ? t.getDueDate().toString() : "");
            o.put("priority", t.getPriority() != null ? t.getPriority() : "");
            actionJson.add(o);
        }

        MinutesOfMeeting mom = momRepository.findByMeetingMeetingId(meetingId).orElseGet(MinutesOfMeeting::new);
        if (mom.getMeeting() == null) {
            mom.setMeeting(meeting);
        }
        mom.setGeneratedBy(userRepository.getReferenceById(generatedByUserId));
        mom.setGeneratedAt(Instant.now());
        mom.setAttendeeCount(participants.size());
        mom.setAgendaItemsCovered(items.size());
        mom.setContentHtml(html);
        mom.setActionItems(actionJson);
        ObjectNode meta = objectMapper.createObjectNode();
        meta.put("version", 1);
        mom.setContentJson(meta);
        mom.setStatus("DRAFT");
        mom = momRepository.save(mom);

        String ua = request != null ? request.getHeader("User-Agent") : null;
        String ip = request != null ? request.getRemoteAddr() : null;
        auditService.log(
                generatedByUserId,
                userRole != null ? userRole : "",
                "GENERATE",
                "MinutesOfMeeting",
                mom.getId(),
                ip,
                DeviceTypeUtil.detect(ua),
                ua,
                "SUCCESS",
                Map.of("meetingId", meetingId.toString()));

        return toDto(mom, meeting.getTitle());
    }

    @Transactional(readOnly = true)
    public Optional<MinutesOfMeetingDto> getByMeetingId(UUID meetingId) {
        return momRepository.findByMeetingMeetingId(meetingId)
                .map(m -> toDto(m, m.getMeeting() != null ? m.getMeeting().getTitle() : ""));
    }

    @Transactional(readOnly = true)
    public MinutesOfMeeting requireForExport(UUID meetingId) {
        return momRepository.findByMeetingMeetingId(meetingId)
                .orElseThrow(() -> new RuntimeException("MoM not found for meeting: " + meetingId));
    }

    private String buildMomHtml(
            Meeting meeting,
            List<AgendaItem> items,
            List<MeetingParticipant> participants,
            List<Task> actionItems) {

        StringBuilder sb = new StringBuilder();
        sb.append("<h1>Minutes of Meeting</h1>");
        sb.append("<h2>").append(escapeHtml(meeting.getTitle())).append("</h2>");
        sb.append("<p><strong>Date:</strong> ")
                .append(meeting.getStartDate())
                .append(" to ")
                .append(meeting.getEndDate())
                .append("</p>");
        sb.append("<p><strong>Location:</strong> ")
                .append(escapeHtml(meeting.getLocation() != null ? meeting.getLocation() : "IMO Headquarters"))
                .append("</p>");
        sb.append("<p><strong>Session:</strong> ")
                .append(escapeHtml(meeting.getSessionNumber() != null ? meeting.getSessionNumber() : "—"))
                .append("</p>");

        sb.append("<h3>Attendees (").append(participants.size()).append(")</h3><ul>");
        for (MeetingParticipant p : participants) {
            String name = p.getUser() != null ? p.getUser().getFullName() : "—";
            sb.append("<li>").append(escapeHtml(name))
                    .append(" — ").append(escapeHtml(p.getMeetingRole())).append("</li>");
        }
        sb.append("</ul>");

        sb.append("<h3>Agenda Items Discussed</h3><ol>");
        for (AgendaItem item : items) {
            sb.append("<li><strong>").append(escapeHtml(item.getItemNumber() != null ? item.getItemNumber() : "—"))
                    .append("</strong> — ").append(escapeHtml(item.getTitle()))
                    .append("<br><em>")
                    .append(escapeHtml(item.getDescription() != null ? item.getDescription() : "Discussed as per agenda"))
                    .append("</em></li>");
        }
        sb.append("</ol>");

        if (!actionItems.isEmpty()) {
            sb.append("<h3>Action Items</h3><table border='1' cellpadding='6'>");
            sb.append("<tr><th>Task</th><th>Assigned To</th><th>Due Date</th></tr>");
            for (Task t : actionItems) {
                String assignee = t.getAssignedTo() != null ? t.getAssignedTo().getFullName() : "—";
                sb.append("<tr><td>").append(escapeHtml(t.getTitle()))
                        .append("</td><td>").append(escapeHtml(assignee))
                        .append("</td><td>").append(escapeHtml(t.getDueDate() != null ? t.getDueDate().toString() : "—"))
                        .append("</td></tr>");
            }
            sb.append("</table>");
        }

        sb.append("<hr><p><em>Generated by ISEP — IMO Strategic Engagement Platform, DGS MoPSW</em></p>");
        return sb.toString();
    }

    private static String escapeHtml(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private MinutesOfMeetingDto toDto(MinutesOfMeeting mom, String meetingTitle) {
        UUID mid = mom.getMeeting() != null ? mom.getMeeting().getMeetingId() : null;
        return new MinutesOfMeetingDto(
                mom.getId(),
                mid,
                meetingTitle != null ? meetingTitle : "",
                mom.getGeneratedAt(),
                mom.getAttendeeCount() != null ? mom.getAttendeeCount() : 0,
                mom.getAgendaItemsCovered() != null ? mom.getAgendaItemsCovered() : 0,
                mom.getContentHtml(),
                mom.getActionItems(),
                mom.getStatus());
    }
}
