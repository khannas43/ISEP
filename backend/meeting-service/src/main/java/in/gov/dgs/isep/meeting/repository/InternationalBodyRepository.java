package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.InternationalBody;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InternationalBodyRepository extends JpaRepository<InternationalBody, UUID> {

    List<InternationalBody> findByIsActiveTrueOrderByName();

    List<InternationalBody> findByParentBodyBodyId(UUID parentBodyId);
}
