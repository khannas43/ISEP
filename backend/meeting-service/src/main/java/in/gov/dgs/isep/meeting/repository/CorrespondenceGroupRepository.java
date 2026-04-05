package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.CorrespondenceGroup;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CorrespondenceGroupRepository extends JpaRepository<CorrespondenceGroup, UUID> {

    List<CorrespondenceGroup> findByParentBodyBodyIdOrderByNameAsc(UUID bodyId);

    /** Fallback: find CGs by parent body name (e.g. when body_id differs but name matches). */
    List<CorrespondenceGroup> findByParentBodyNameOrderByNameAsc(String name);
}
