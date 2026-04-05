package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.WorkflowInstance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WorkflowInstanceRepository extends JpaRepository<WorkflowInstance, UUID> {

    Page<WorkflowInstance> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
