package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.ConsultationAgency;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConsultationAgencyRepository extends JpaRepository<ConsultationAgency, UUID> {

    List<ConsultationAgency> findByConsultation_IdOrderByAgencyNameAsc(UUID consultationId);

    Optional<ConsultationAgency> findByConsultation_IdAndAgencyUser_UserId(UUID consultationId, UUID agencyUserId);
}
