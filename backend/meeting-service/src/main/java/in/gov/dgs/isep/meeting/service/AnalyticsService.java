package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.Meeting;
import in.gov.dgs.isep.meeting.domain.Paper;
import in.gov.dgs.isep.meeting.domain.Task;
import in.gov.dgs.isep.meeting.repository.MeetingParticipantRepository;
import in.gov.dgs.isep.meeting.repository.MeetingRepository;
import in.gov.dgs.isep.meeting.repository.PaperRepository;
import in.gov.dgs.isep.meeting.repository.TaskRepository;
import in.gov.dgs.isep.meeting.web.AnalyticsDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AnalyticsService {

    private final MeetingRepository meetingRepository;
    private final TaskRepository taskRepository;
    private final MeetingParticipantRepository participantRepository;
    private final PaperRepository paperRepository;

    public AnalyticsService(
            MeetingRepository meetingRepository,
            TaskRepository taskRepository,
            MeetingParticipantRepository participantRepository,
            PaperRepository paperRepository) {
        this.meetingRepository = meetingRepository;
        this.taskRepository = taskRepository;
        this.participantRepository = participantRepository;
        this.paperRepository = paperRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsDto getAnalytics(UUID meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));
        String title = meeting.getTitle() != null ? meeting.getTitle() : "";

        long totalMembers = participantRepository.countByMeetingMeetingId(meetingId);
        long participated = totalMembers;

        List<Task> tasks = taskRepository.findByMeetingMeetingIdOrderByDueDateAsc(meetingId);
        long tasksTotal = tasks.size();
        long tasksCompleted = tasks.stream()
                .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()))
                .count();
        Instant now = Instant.now();
        long tasksOverdue = tasks.stream()
                .filter(t -> isOverdue(t, now))
                .count();

        List<Paper> papers = paperRepository.findByMeetingMeetingId(meetingId);
        long papersDraft = papers.stream()
                .filter(p -> "DRAFT".equalsIgnoreCase(s(p.getStatus())))
                .count();
        long papersApproved = papers.stream()
                .filter(p -> {
                    String s = s(p.getStatus());
                    return "APPROVED".equalsIgnoreCase(s) || "IN_APPROVAL".equalsIgnoreCase(s);
                })
                .count();
        long papersFinalised = papers.stream()
                .filter(p -> "FINALIZED".equalsIgnoreCase(s(p.getStatus())))
                .count();

        double taskCompletionRatePercent = tasksTotal > 0
                ? Math.round((double) tasksCompleted / tasksTotal * 1000.0) / 10.0
                : 0.0;

        return new AnalyticsDto(
                meetingId,
                title,
                totalMembers,
                participated,
                tasksTotal,
                tasksCompleted,
                tasksOverdue,
                taskCompletionRatePercent,
                papersDraft,
                papersApproved,
                papersFinalised,
                null);
    }

    private static String s(String status) {
        return status == null ? "" : status.trim();
    }

    private static boolean isOverdue(Task t, Instant now) {
        if ("COMPLETED".equalsIgnoreCase(t.getStatus())) {
            return false;
        }
        if ("ESCALATED".equalsIgnoreCase(t.getStatus()) || "OVERDUE".equalsIgnoreCase(t.getStatus())) {
            return true;
        }
        return t.getDueDate() != null && t.getDueDate().isBefore(now);
    }
}
