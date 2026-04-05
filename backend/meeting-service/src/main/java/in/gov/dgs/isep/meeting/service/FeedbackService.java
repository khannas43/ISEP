package in.gov.dgs.isep.meeting.service;

/**
 * Business logic for agenda-item feedback (SCR-COL).
 * List by agenda item, get by user, save draft, submit, mark reviewed.
 * If JWT subject (Keycloak user id) is not in core.users, saveDraft uses first active user as fallback (demo).
 */
import in.gov.dgs.isep.meeting.domain.AgendaItem;
import in.gov.dgs.isep.meeting.domain.Feedback;
import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.repository.AgendaItemRepository;
import in.gov.dgs.isep.meeting.repository.DocumentRepository;
import in.gov.dgs.isep.meeting.repository.FeedbackRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.web.FeedbackDto;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final AgendaItemRepository agendaItemRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           AgendaItemRepository agendaItemRepository,
                           UserRepository userRepository,
                           DocumentRepository documentRepository) {
        this.feedbackRepository = feedbackRepository;
        this.agendaItemRepository = agendaItemRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
    }

    @Transactional(readOnly = true)
    public List<FeedbackDto> listByAgendaItem(UUID agendaItemId) {
        return feedbackRepository.findByAgendaItemAgendaItemIdOrderByUpdatedAtDesc(agendaItemId)
                .stream()
                .map(FeedbackDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FeedbackDto getByAgendaItemAndUser(UUID agendaItemId, UUID userId) {
        return feedbackRepository.findByAgendaItemAgendaItemIdAndUserUserId(agendaItemId, userId)
                .map(FeedbackDto::from)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public FeedbackDto get(UUID feedbackId) {
        return feedbackRepository.findById(feedbackId)
                .map(FeedbackDto::from)
                .orElseThrow(() -> new RuntimeException("Feedback not found: " + feedbackId));
    }

    @Transactional
    public FeedbackDto saveDraft(UUID agendaItemId, UUID userId, String position, String comments, String suggestedAmendments, UUID documentId) {
        AgendaItem agendaItem = agendaItemRepository.findById(agendaItemId)
                .orElseThrow(() -> new RuntimeException("Agenda item not found: " + agendaItemId));
        User user = userRepository.findById(userId)
                .orElseGet(() -> {
                    var first = userRepository.findByIsActiveTrue(PageRequest.of(0, 1)).getContent();
                    if (first.isEmpty()) {
                        throw new RuntimeException("User not found: " + userId + ". No users in database; run user/seed data first.");
                    }
                    return first.get(0);
                });

        Feedback feedback = feedbackRepository.findByAgendaItemAgendaItemIdAndUserUserId(agendaItemId, userId)
                .orElseGet(Feedback::new);

        if (feedback.getFeedbackId() == null) {
            feedback.setAgendaItem(agendaItem);
            feedback.setUser(user);
        }
        feedback.setPosition(position != null && !position.isBlank() ? position : "NEUTRAL");
        feedback.setComments(comments);
        feedback.setSuggestedAmendments(suggestedAmendments);
        feedback.setStatus("DRAFT");
        if (documentId != null) {
            feedback.setDocument(documentRepository.findById(documentId).orElse(null));
        } else {
            feedback.setDocument(null);
        }
        feedback = feedbackRepository.save(feedback);
        return FeedbackDto.from(feedback);
    }

    @Transactional
    public FeedbackDto submit(UUID feedbackId, UUID userId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found: " + feedbackId));
        feedback.setStatus("SUBMITTED");
        feedback.setSubmittedAt(Instant.now());
        feedback = feedbackRepository.save(feedback);
        return FeedbackDto.from(feedback);
    }

    @Transactional
    public FeedbackDto markReviewed(UUID feedbackId, UUID reviewedByUserId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found: " + feedbackId));
        User reviewer = userRepository.findById(reviewedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found: " + reviewedByUserId));
        feedback.setStatus("REVIEWED");
        feedback.setReviewedBy(reviewer);
        feedback.setReviewedAt(Instant.now());
        feedback = feedbackRepository.save(feedback);
        return FeedbackDto.from(feedback);
    }
}
