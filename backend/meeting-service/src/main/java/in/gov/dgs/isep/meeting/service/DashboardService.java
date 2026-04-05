package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.*;
import in.gov.dgs.isep.meeting.repository.*;
import in.gov.dgs.isep.meeting.web.dashboard.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Aggregates data for the ISEP Executive Dashboard: summary, agenda readiness, paper pipeline,
 * pending actions, delegation activity. Used by DashboardController.
 */
@Service
public class DashboardService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final String[] STAGE_NAMES = { "Draft", "Grp Ldr", "Del Ldr", "IC Div", "CS/NA", "CSS", "DG", "Final" };

    private final MeetingRepository meetingRepository;
    private final AgendaItemRepository agendaItemRepository;
    private final TaskRepository taskRepository;
    private final PaperRepository paperRepository;
    private final FeedbackRepository feedbackRepository;
    private final MeetingParticipantRepository participantRepository;
    private final PaperApprovalStageRepository paperApprovalStageRepository;
    private final UserRepository userRepository;

    public DashboardService(MeetingRepository meetingRepository,
                            AgendaItemRepository agendaItemRepository,
                            TaskRepository taskRepository,
                            PaperRepository paperRepository,
                            FeedbackRepository feedbackRepository,
                            MeetingParticipantRepository participantRepository,
                            PaperApprovalStageRepository paperApprovalStageRepository,
                            UserRepository userRepository) {
        this.meetingRepository = meetingRepository;
        this.agendaItemRepository = agendaItemRepository;
        this.taskRepository = taskRepository;
        this.paperRepository = paperRepository;
        this.feedbackRepository = feedbackRepository;
        this.participantRepository = participantRepository;
        this.paperApprovalStageRepository = paperApprovalStageRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getSummary(UUID meetingId, String role, UUID userId) {
        Meeting meeting = meetingRepository.findByIdWithBody(meetingId).orElse(null);
        if (meeting == null) {
            return null;
        }

        List<AgendaItem> agendaItems = agendaItemRepository.findByMeetingMeetingIdOrderByItemNumberAsc(meetingId);
        List<UUID> agendaItemIds = agendaItems.stream().map(AgendaItem::getAgendaItemId).toList();

        List<Task> tasks = taskRepository.findByMeetingMeetingIdOrderByDueDateAsc(meetingId);
        int tasksTotal = tasks.size();
        long tasksComplete = tasks.stream().filter(t -> "DONE".equalsIgnoreCase(t.getStatus())).count();

        long feedbackTotal = agendaItemIds.isEmpty() ? 0 : feedbackRepository.countByAgendaItemAgendaItemIdIn(agendaItemIds);
        long feedbackConsolidated = agendaItemIds.isEmpty() ? 0 : feedbackRepository.countByAgendaItemAgendaItemIdInAndStatus(agendaItemIds, "SUBMITTED");

        List<Paper> papers = paperRepository.findByMeetingMeetingId(meetingId);
        int papersTotal = papers.size();
        long papersReady = papers.stream().filter(p -> "FINALIZED".equalsIgnoreCase(p.getStatus())).count();

        int score = computePreparednessScore(tasksTotal, (int) tasksComplete, (int) feedbackTotal, (int) feedbackConsolidated, papersTotal, (int) papersReady);
        int trend = 0; // could compare to previous week if we stored history

        LocalDate start = meeting.getStartDate();
        LocalDate today = LocalDate.now();
        int daysToMeeting = start != null ? (int) ChronoUnit.DAYS.between(today, start) : 0;
        String status = daysToMeeting < 0 ? "COMPLETED" : (daysToMeeting <= 7 ? "IN_PROGRESS" : "UPCOMING");

        int pendingActions = countPendingActionsForUser(meetingId, userId, role);
        int criticalAlerts = (int) agendaItems.stream().filter(ai -> "HIGH".equalsIgnoreCase(ai.getPriority()) && papers.stream().noneMatch(p -> p.getAgendaItem() != null && p.getAgendaItem().getAgendaItemId().equals(ai.getAgendaItemId()))).count();

        String bodyName = meeting.getBody() != null ? meeting.getBody().getName() : "";
        if (bodyName.length() > 20) bodyName = bodyName.substring(0, 17) + "...";
        Integer sessionNum = meeting.getSessionNumber() != null && !meeting.getSessionNumber().isEmpty() ? parseIntOrNull(meeting.getSessionNumber()) : null;

        DashboardSummaryDto.MeetingSummary meetingSummary = new DashboardSummaryDto.MeetingSummary();
        meetingSummary.setTitle(meeting.getTitle());
        meetingSummary.setBody(bodyName);
        meetingSummary.setSession(sessionNum != null ? sessionNum : 0);
        meetingSummary.setLocation(meeting.getLocation());
        meetingSummary.setStartDate(start != null ? start.format(DATE_FMT) : "");
        meetingSummary.setEndDate(meeting.getEndDate() != null ? meeting.getEndDate().format(DATE_FMT) : "");
        meetingSummary.setDaysToMeeting(daysToMeeting);
        meetingSummary.setStatus(status);

        DashboardSummaryDto.PreparednessSummary prep = new DashboardSummaryDto.PreparednessSummary();
        prep.setScore(score);
        prep.setTrend(trend);
        prep.setTasksComplete((int) tasksComplete);
        prep.setTasksTotal(tasksTotal);
        prep.setFeedbackConsolidated((int) feedbackConsolidated);
        prep.setFeedbackTotal((int) feedbackTotal);
        prep.setPapersReady((int) papersReady);
        prep.setPapersTotal(papersTotal);

        DashboardSummaryDto dto = new DashboardSummaryDto();
        dto.setMeeting(meetingSummary);
        dto.setPreparedness(prep);
        dto.setPendingActions(pendingActions);
        dto.setCriticalAlerts(criticalAlerts);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<AgendaReadinessDto> getAgendaReadiness(UUID meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId).orElse(null);
        if (meeting == null) return List.of();

        List<AgendaItem> items = agendaItemRepository.findByMeetingMeetingIdOrderByItemNumberAsc(meetingId);
        List<Paper> papers = paperRepository.findByMeetingMeetingId(meetingId);
        List<Task> meetingTasks = taskRepository.findByMeetingMeetingIdOrderByDueDateAsc(meetingId);

        List<AgendaReadinessDto> result = new ArrayList<>();
        for (AgendaItem ai : items) {
            UUID aiId = ai.getAgendaItemId();
            long tasksTotal = meetingTasks.size();
            long tasksComplete = meetingTasks.stream().filter(t -> "DONE".equalsIgnoreCase(t.getStatus())).count();
            Paper linkedPaper = papers.stream().filter(p -> p.getAgendaItem() != null && p.getAgendaItem().getAgendaItemId().equals(aiId)).findFirst().orElse(null);
            String paperStatus = linkedPaper != null ? linkedPaper.getStatus() : null;
            boolean submissionRequired = "HIGH".equalsIgnoreCase(ai.getPriority());
            List<Feedback> feedbacks = feedbackRepository.findByAgendaItemAgendaItemIdOrderByUpdatedAtDesc(aiId);
            boolean positionReady = feedbacks.stream().anyMatch(f -> "SUBMITTED".equalsIgnoreCase(f.getStatus()));
            Integer daysLeft = null;
            if (ai.getDeadlineForInputs() != null) {
                long days = ChronoUnit.DAYS.between(Instant.now().atZone(ZoneId.systemDefault()).toLocalDate(), ai.getDeadlineForInputs().atZone(ZoneId.systemDefault()).toLocalDate());
                daysLeft = (int) days;
            }
            AgendaReadinessDto ard = new AgendaReadinessDto();
            ard.setId("AI-" + (ai.getItemNumber() != null ? ai.getItemNumber().replaceAll("\\D+", "") : aiId.toString().substring(0, 4)));
            ard.setTitle(ai.getTitle());
            ard.setPriority(ai.getPriority() != null ? ai.getPriority() : "MEDIUM");
            ard.setSubmissionRequired(submissionRequired);
            ard.setPositionReady(positionReady);
            ard.setPaperStatus(paperStatus);
            ard.setTasksComplete((int) tasksComplete);
            ard.setTasksTotal((int) tasksTotal);
            ard.setDaysLeft(daysLeft);
            result.add(ard);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<PaperPipelineDto> getPaperPipeline(UUID meetingId) {
        List<Paper> papers = paperRepository.findByMeetingMeetingId(meetingId);
        List<PaperPipelineDto> result = new ArrayList<>();
        for (Paper p : papers) {
            List<PaperApprovalStage> stages = paperApprovalStageRepository.findByPaperPaperIdOrderByStageNumberAsc(p.getPaperId());
            int stageNum = "FINALIZED".equalsIgnoreCase(p.getStatus()) ? 8 : (stages.isEmpty() ? 1 : stages.size());
            String stageName = stageNum >= 8 ? "FINALIZED" : (stageNum < STAGE_NAMES.length ? STAGE_NAMES[stageNum - 1] : "Draft");
            String lastAction = "Created";
            String lastActionDate = "";
            if (!stages.isEmpty()) {
                PaperApprovalStage last = stages.get(stages.size() - 1);
                lastAction = last.getActedAt() != null ? "Approved by " + (last.getApproverUser() != null ? last.getApproverUser().getFullName() : "—") : "Pending";
                lastActionDate = last.getActedAt() != null ? DateTimeFormatter.ofPattern("dd MMM yyyy").format(last.getActedAt().atZone(ZoneId.systemDefault())) : "";
            }
            if (lastActionDate.isEmpty() && p.getUpdatedAt() != null) {
                lastActionDate = DateTimeFormatter.ofPattern("dd MMM yyyy").format(p.getUpdatedAt().atZone(ZoneId.systemDefault()));
            }
            String agendaItem = p.getAgendaItem() != null && p.getAgendaItem().getItemNumber() != null ? "Item " + p.getAgendaItem().getItemNumber() : "—";
            boolean urgent = "DRAFT".equalsIgnoreCase(p.getStatus()) && p.getMeeting() != null && ChronoUnit.DAYS.between(LocalDate.now(), p.getMeeting().getStartDate()) < 30;
            PaperPipelineDto ppd = new PaperPipelineDto();
            ppd.setId(p.getPaperId().toString());
            ppd.setTitle(p.getTitle());
            ppd.setAgendaItem(agendaItem);
            ppd.setStage(stageNum);
            ppd.setStageName(stageName);
            ppd.setLastAction(lastAction);
            ppd.setLastActionDate(lastActionDate);
            ppd.setSubmittedBy("DGS HQ");
            ppd.setUrgent(urgent);
            result.add(ppd);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<PendingActionDto> getPendingActions(UUID userId, String role) {
        List<PendingActionDto> result = new ArrayList<>();
        List<Task> userTasks = taskRepository.findByAssignedTo_UserIdOrderByDueDateAsc(userId);
        for (Task t : userTasks) {
            if ("DONE".equalsIgnoreCase(t.getStatus())) continue;
            boolean overdue = t.getDueDate() != null && t.getDueDate().isBefore(Instant.now());
            PendingActionDto pad = new PendingActionDto();
            pad.setId(t.getTaskId().toString());
            pad.setType(overdue ? "TASK_OVERDUE" : "APPROVAL_REQUIRED");
            pad.setTitle(t.getTitle() != null ? (t.getTitle().length() > 50 ? t.getTitle().substring(0, 50) + "…" : t.getTitle()) : "Task");
            pad.setDetail(t.getDescription() != null ? t.getDescription() : "");
            pad.setPriority(t.getPriority() != null ? t.getPriority() : "MEDIUM");
            pad.setDueDate(t.getDueDate() != null ? t.getDueDate().atZone(ZoneId.systemDefault()).format(DATE_FMT) : "—");
            pad.setScreen("/meetings/" + (t.getMeeting() != null ? t.getMeeting().getMeetingId() : "") + "/tasks");
            result.add(pad);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<DelegationActivityDto> getDelegationActivity(UUID meetingId, String role, UUID userId) {
        List<MeetingParticipant> participants = participantRepository.findByMeetingMeetingIdOrderByAssignedAtAsc(meetingId);
        List<Task> tasks = taskRepository.findByMeetingMeetingIdOrderByDueDateAsc(meetingId);
        List<AgendaItem> agendaItems = agendaItemRepository.findByMeetingMeetingIdOrderByItemNumberAsc(meetingId);
        List<Paper> papers = paperRepository.findByMeetingMeetingId(meetingId);

        Map<String, List<MeetingParticipant>> byOrg = new LinkedHashMap<>();
        for (MeetingParticipant mp : participants) {
            if (mp.getUser() == null) continue;
            String org = mp.getUser().getOrganization() != null && !mp.getUser().getOrganization().isEmpty() ? mp.getUser().getOrganization() : "DGS HQ";
            byOrg.computeIfAbsent(org, k -> new ArrayList<>()).add(mp);
        }
        List<DelegationActivityDto> result = new ArrayList<>();
        for (Map.Entry<String, List<MeetingParticipant>> e : byOrg.entrySet()) {
            String org = e.getKey();
            List<UUID> orgUserIds = e.getValue().stream().map(mp -> mp.getUser().getUserId()).toList();
            int tasksTotal = (int) tasks.stream().filter(t -> t.getAssignedTo() != null && orgUserIds.contains(t.getAssignedTo().getUserId())).count();
            int tasksComplete = (int) tasks.stream().filter(t -> t.getAssignedTo() != null && orgUserIds.contains(t.getAssignedTo().getUserId()) && "DONE".equalsIgnoreCase(t.getStatus())).count();
            int feedbackSubmitted = 0;
            for (AgendaItem ai : agendaItems) {
                for (Feedback f : feedbackRepository.findByAgendaItemAgendaItemIdOrderByUpdatedAtDesc(ai.getAgendaItemId())) {
                    if (f.getUser() != null && orgUserIds.contains(f.getUser().getUserId()) && "SUBMITTED".equalsIgnoreCase(f.getStatus())) feedbackSubmitted++;
                }
            }
            int papersOwned = (int) papers.stream().filter(p -> p.getDraftLastModifiedBy() != null && orgUserIds.contains(p.getDraftLastModifiedBy())).count();
            String roleLabel = e.getValue().stream().map(MeetingParticipant::getMeetingRole).filter(Objects::nonNull).findFirst().orElse("Member");
            String status = tasksTotal == 0 ? "COMPLETE" : (tasksComplete >= tasksTotal ? "COMPLETE" : (tasksComplete >= tasksTotal * 0.7 ? "ON_TRACK" : "AT_RISK"));
            DelegationActivityDto dad = new DelegationActivityDto();
            dad.setOrg(org);
            dad.setRole(roleLabel);
            dad.setTasksComplete(tasksComplete);
            dad.setTasksTotal(tasksTotal);
            dad.setFeedbackSubmitted(feedbackSubmitted);
            dad.setPapersOwned(papersOwned);
            dad.setStatus(status);
            result.add(dad);
        }
        if (result.isEmpty()) {
            DelegationActivityDto empty = new DelegationActivityDto();
            empty.setOrg("DGS HQ");
            empty.setRole("Lead");
            empty.setTasksComplete(0);
            empty.setTasksTotal(0);
            empty.setFeedbackSubmitted(0);
            empty.setPapersOwned(0);
            empty.setStatus("ON_TRACK");
            result.add(empty);
        }
        return result;
    }

    private int computePreparednessScore(int tasksTotal, int tasksComplete, int feedbackTotal, int feedbackConsolidated, int papersTotal, int papersReady) {
        if (tasksTotal + feedbackTotal + papersTotal == 0) return 100;
        int t = tasksTotal > 0 ? (tasksComplete * 100 / tasksTotal) : 100;
        int f = feedbackTotal > 0 ? (feedbackConsolidated * 100 / feedbackTotal) : 100;
        int p = papersTotal > 0 ? (papersReady * 100 / papersTotal) : 100;
        return (t + f + p) / 3;
    }

    private int countPendingActionsForUser(UUID meetingId, UUID userId, String role) {
        List<Task> tasks = taskRepository.findByMeetingMeetingIdOrderByDueDateAsc(meetingId);
        return (int) tasks.stream()
                .filter(t -> t.getAssignedTo() != null && t.getAssignedTo().getUserId().equals(userId) && !"DONE".equalsIgnoreCase(t.getStatus()))
                .count();
    }

    private static Integer parseIntOrNull(String s) {
        if (s == null || s.isEmpty()) return null;
        try {
            return Integer.parseInt(s.replaceAll("\\D+", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
