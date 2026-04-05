package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.PaperApprovalStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaperApprovalStageRepository extends JpaRepository<PaperApprovalStage, UUID> {

    List<PaperApprovalStage> findByPaperPaperIdOrderByStageNumberAsc(UUID paperId);
}
