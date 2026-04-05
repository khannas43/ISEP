package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.Consultation;
import in.gov.dgs.isep.meeting.domain.ConsultationAgency;
import in.gov.dgs.isep.meeting.domain.Document;
import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.repository.ConsultationAgencyRepository;
import in.gov.dgs.isep.meeting.repository.ConsultationRepository;
import in.gov.dgs.isep.meeting.repository.DocumentRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.web.ConsultationDtos.ConsultationAgencyResponseDto;
import in.gov.dgs.isep.meeting.web.ConsultationDtos.ConsultationResponseDto;
import in.gov.dgs.isep.meeting.web.ConsultationDtos.ExternalAgencyCandidateDto;
import in.gov.dgs.isep.meeting.web.ConsultationDtos.SendConsultationRequest;
import in.gov.dgs.isep.meeting.web.ConsultationDtos.SubmitFeedbackRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final ConsultationAgencyRepository consultationAgencyRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ConsultationService(
            ConsultationRepository consultationRepository,
            ConsultationAgencyRepository consultationAgencyRepository,
            DocumentRepository documentRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.consultationRepository = consultationRepository;
        this.consultationAgencyRepository = consultationAgencyRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponseDto> listForDocument(UUID documentId, UUID viewerUserId) {
        documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        return consultationRepository.findByDocument_DocumentIdOrderBySentAtDesc(documentId).stream()
                .map(c -> toDto(c, viewerUserId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExternalAgencyCandidateDto> listExternalAgencyCandidates() {
        return userRepository.findByIsExternalTrueAndIsActiveTrueOrderByOrganizationAscFullNameAsc().stream()
                .map(u -> new ExternalAgencyCandidateDto(
                        u.getUserId().toString(),
                        u.getFullName(),
                        u.getOrganization() != null ? u.getOrganization() : ""))
                .toList();
    }

    @Transactional
    public ConsultationResponseDto sendForConsultation(UUID documentId, SendConsultationRequest request, UUID sentByUserId) {
        if (request.agencyUserIds() == null || request.agencyUserIds().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "agencyUserIds required");
        }
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        User sentBy = userRepository.findById(sentByUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));

        Consultation c = new Consultation();
        c.setDocument(document);
        c.setSentBy(sentBy);
        c.setSentAt(Instant.now());
        c.setDeadline(request.deadline());
        c.setNotes(request.notes());
        c.setStatus("OPEN");
        c = consultationRepository.save(c);

        for (UUID agencyUserId : request.agencyUserIds()) {
            User agencyUser = userRepository.findById(agencyUserId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown agency user: " + agencyUserId));
            if (!Boolean.TRUE.equals(agencyUser.getIsExternal())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not an external agency: " + agencyUserId);
            }
            ConsultationAgency ca = new ConsultationAgency();
            ca.setConsultation(c);
            ca.setAgencyUser(agencyUser);
            String name = agencyUser.getOrganization() != null && !agencyUser.getOrganization().isBlank()
                    ? agencyUser.getOrganization()
                    : agencyUser.getFullName();
            ca.setAgencyName(name);
            ca.setStatus("PENDING");
            consultationAgencyRepository.save(ca);
            notificationService.notifyConsultation(agencyUserId, documentId, c.getId());
        }

        return toDto(consultationRepository.findById(c.getId()).orElse(c), sentByUserId);
    }

    @Transactional
    public void submitFeedback(UUID consultationId, SubmitFeedbackRequest request, UUID agencyUserId) {
        if (request.feedbackHtml() == null || request.feedbackHtml().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "feedbackHtml required");
        }
        ConsultationAgency ca = consultationAgencyRepository
                .findByConsultation_IdAndAgencyUser_UserId(consultationId, agencyUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a consultation participant"));
        if ("FEEDBACK_SUBMITTED".equals(ca.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Feedback already submitted");
        }
        ca.setFeedbackHtml(request.feedbackHtml());
        ca.setStatus("FEEDBACK_SUBMITTED");
        ca.setFeedbackSubmittedAt(Instant.now());
        consultationAgencyRepository.save(ca);

        Consultation c = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consultation not found"));
        notificationService.notifyFeedbackReceived(c.getSentBy().getUserId(), agencyUserId, consultationId);

        List<ConsultationAgency> rows = consultationAgencyRepository.findByConsultation_IdOrderByAgencyNameAsc(consultationId);
        boolean allDone = !rows.isEmpty() && rows.stream().allMatch(r -> "FEEDBACK_SUBMITTED".equals(r.getStatus()));
        if (allDone) {
            c.setStatus("COMPLETED");
            consultationRepository.save(c);
        }
    }

    private ConsultationResponseDto toDto(Consultation c, UUID viewerUserId) {
        List<ConsultationAgency> rows = consultationAgencyRepository.findByConsultation_IdOrderByAgencyNameAsc(c.getId());
        List<ConsultationAgencyResponseDto> agencies = new ArrayList<>();
        for (ConsultationAgency ca : rows) {
            UUID aid = ca.getAgencyUser().getUserId();
            agencies.add(new ConsultationAgencyResponseDto(
                    ca.getId().toString(),
                    aid.toString(),
                    ca.getAgencyName(),
                    ca.getStatus(),
                    ca.getFeedbackHtml(),
                    ca.getFeedbackSubmittedAt() != null ? ca.getFeedbackSubmittedAt().toString() : null,
                    viewerUserId != null && viewerUserId.equals(aid)
            ));
        }
        LocalDate deadline = c.getDeadline();
        return new ConsultationResponseDto(
                c.getId().toString(),
                c.getDocument().getDocumentId().toString(),
                c.getSentBy().getUserId().toString(),
                c.getSentAt() != null ? c.getSentAt().toString() : null,
                deadline != null ? deadline.toString() : null,
                c.getNotes(),
                c.getStatus(),
                agencies
        );
    }
}
