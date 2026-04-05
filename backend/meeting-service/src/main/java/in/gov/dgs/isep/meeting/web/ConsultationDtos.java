package in.gov.dgs.isep.meeting.web;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class ConsultationDtos {

    private ConsultationDtos() {}

    public record ConsultationAgencyResponseDto(
            String id,
            String agencyUserId,
            String agencyName,
            String status,
            String feedbackHtml,
            String feedbackSubmittedAt,
            boolean currentUser
    ) {}

    public record ConsultationResponseDto(
            String id,
            String documentId,
            String sentByUserId,
            String sentAt,
            String deadline,
            String notes,
            String status,
            List<ConsultationAgencyResponseDto> agencies
    ) {}

    public record SendConsultationRequest(List<UUID> agencyUserIds, LocalDate deadline, String notes) {}

    public record SubmitFeedbackRequest(String feedbackHtml) {}

    public record ExternalAgencyCandidateDto(String userId, String fullName, String organization) {}
}
