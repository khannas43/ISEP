package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.UserBodyAssignment;
import in.gov.dgs.isep.meeting.domain.UserBodyAssignmentId;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBodyAssignmentRepository extends JpaRepository<UserBodyAssignment, UserBodyAssignmentId> {

    List<UserBodyAssignment> findByUserIdOrderByBodyId(UUID userId);

    void deleteByUserId(UUID userId);
}
