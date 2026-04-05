package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.Feedback;
import in.gov.dgs.isep.meeting.repository.FeedbackRepository;
import in.gov.dgs.isep.meeting.web.FeedbackArchivePageDto;
import in.gov.dgs.isep.meeting.web.FeedbackArchiveRowDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FeedbackArchiveService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackArchiveService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @Transactional(readOnly = true)
    public FeedbackArchivePageDto list(
            UUID meetingId,
            UUID agendaItemId,
            UUID submittedBy,
            String positionFilter,
            Pageable pageable
    ) {
        String position = positionFilter;
        if (position != null && ("ALL".equalsIgnoreCase(position) || position.isBlank())) {
            position = null;
        }
        Page<Feedback> page = feedbackRepository.findMeetingArchive(
                meetingId, agendaItemId, submittedBy, position, pageable
        );
        List<FeedbackArchiveRowDto> data = page.getContent().stream()
                .map(this::toRow)
                .collect(Collectors.toList());
        FeedbackArchivePageDto.PaginationDto p = new FeedbackArchivePageDto.PaginationDto();
        p.setPage(page.getNumber());
        p.setSize(page.getSize());
        p.setTotalElements(page.getTotalElements());
        FeedbackArchivePageDto dto = new FeedbackArchivePageDto();
        dto.setData(data);
        dto.setPagination(p);
        return dto;
    }

    private FeedbackArchiveRowDto toRow(Feedback f) {
        FeedbackArchiveRowDto row = new FeedbackArchiveRowDto();
        row.setFeedbackId(f.getFeedbackId());
        row.setAgendaItemId(f.getAgendaItem() != null ? f.getAgendaItem().getAgendaItemId() : null);
        row.setAgendaItemTitle(f.getAgendaItem() != null ? f.getAgendaItem().getTitle() : null);
        row.setAgendaItemNumber(f.getAgendaItem() != null ? f.getAgendaItem().getItemNumber() : null);
        FeedbackArchiveRowDto.SubmittedByDto by = new FeedbackArchiveRowDto.SubmittedByDto();
        by.setUserId(f.getUser() != null ? f.getUser().getUserId() : null);
        by.setFullName(f.getUser() != null ? f.getUser().getFullName() : null);
        row.setSubmittedBy(by);
        row.setPosition(f.getPosition());
        row.setComments(f.getComments());
        row.setStatus(f.getStatus());
        row.setSubmittedAt(f.getSubmittedAt());
        row.setConsolidation(null);
        return row;
    }
}
