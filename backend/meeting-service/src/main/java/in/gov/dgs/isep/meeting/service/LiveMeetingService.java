package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.AgendaItem;
import in.gov.dgs.isep.meeting.domain.Meeting;
import in.gov.dgs.isep.meeting.domain.MeetingIntervention;
import in.gov.dgs.isep.meeting.domain.MeetingOutcome;
import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.repository.AgendaItemRepository;
import in.gov.dgs.isep.meeting.repository.MeetingInterventionRepository;
import in.gov.dgs.isep.meeting.repository.MeetingOutcomeRepository;
import in.gov.dgs.isep.meeting.repository.MeetingRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.web.CreateInterventionRequest;
import in.gov.dgs.isep.meeting.web.CreateOutcomeRequest;
import in.gov.dgs.isep.meeting.web.InterventionDto;
import in.gov.dgs.isep.meeting.web.OutcomeDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LiveMeetingService {

    private final MeetingRepository meetingRepository;
    private final AgendaItemRepository agendaItemRepository;
    private final MeetingInterventionRepository interventionRepository;
    private final MeetingOutcomeRepository outcomeRepository;
    private final UserRepository userRepository;

    public LiveMeetingService(MeetingRepository meetingRepository,
                              AgendaItemRepository agendaItemRepository,
                              MeetingInterventionRepository interventionRepository,
                              MeetingOutcomeRepository outcomeRepository,
                              UserRepository userRepository) {
        this.meetingRepository = meetingRepository;
        this.agendaItemRepository = agendaItemRepository;
        this.interventionRepository = interventionRepository;
        this.outcomeRepository = outcomeRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<InterventionDto> listInterventions(UUID meetingId) {
        return interventionRepository.findByMeetingMeetingIdOrderByDeliveredAtDesc(meetingId)
                .stream().map(InterventionDto::from).collect(Collectors.toList());
    }

    @Transactional
    public InterventionDto createIntervention(UUID meetingId, CreateInterventionRequest request, UUID userId) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));
        AgendaItem agendaItem = agendaItemRepository.findById(request.getAgendaItemId()).orElseThrow(() -> new RuntimeException("Agenda item not found"));
        if (!agendaItem.getMeeting().getMeetingId().equals(meetingId)) {
            throw new RuntimeException("Agenda item does not belong to this meeting");
        }
        MeetingIntervention i = new MeetingIntervention();
        i.setMeeting(meeting);
        i.setAgendaItem(agendaItem);
        i.setInterventionText(request.getInterventionText());
        i.setDeliveredByName(request.getDeliveredByName() != null ? request.getDeliveredByName() : "—");
        i.setDeliveredAt(Instant.now());
        i.setInterventionType(request.getInterventionType() != null ? request.getInterventionType() : "INFORMATION");
        if (userId != null) {
            userRepository.findById(userId).ifPresent(i::setDeliveredByUser);
        }
        interventionRepository.save(i);
        return InterventionDto.from(i);
    }

    @Transactional(readOnly = true)
    public List<OutcomeDto> listOutcomes(UUID meetingId) {
        return outcomeRepository.findByMeetingMeetingIdOrderByCapturedAtDesc(meetingId)
                .stream().map(OutcomeDto::from).collect(Collectors.toList());
    }

    @Transactional
    public OutcomeDto createOutcome(UUID meetingId, CreateOutcomeRequest request, UUID userId) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));
        AgendaItem agendaItem = agendaItemRepository.findById(request.getAgendaItemId()).orElseThrow(() -> new RuntimeException("Agenda item not found"));
        if (!agendaItem.getMeeting().getMeetingId().equals(meetingId)) {
            throw new RuntimeException("Agenda item does not belong to this meeting");
        }
        MeetingOutcome o = new MeetingOutcome();
        o.setMeeting(meeting);
        o.setAgendaItem(agendaItem);
        o.setDecision(request.getDecision());
        o.setResolutionRef(request.getResolutionRef());
        o.setNextSteps(request.getNextSteps());
        o.setCapturedAt(Instant.now());
        if (userId != null) {
            userRepository.findById(userId).ifPresent(o::setCapturedByUser);
        }
        outcomeRepository.save(o);
        return OutcomeDto.from(o);
    }
}
