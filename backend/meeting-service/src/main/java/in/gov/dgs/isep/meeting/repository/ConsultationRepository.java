package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ConsultationRepository extends JpaRepository<Consultation, UUID> {

    List<Consultation> findByDocument_DocumentIdOrderBySentAtDesc(UUID documentId);
}
