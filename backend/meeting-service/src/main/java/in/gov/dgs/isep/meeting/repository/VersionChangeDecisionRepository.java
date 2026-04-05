package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.VersionChangeDecision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VersionChangeDecisionRepository extends JpaRepository<VersionChangeDecision, UUID> {

    List<VersionChangeDecision> findByDocumentDocumentIdAndFromVersionAndToVersion(
            UUID documentId, int fromVersion, int toVersion);

    Optional<VersionChangeDecision> findByDocumentDocumentIdAndFromVersionAndToVersionAndChangeIndex(
            UUID documentId, int fromVersion, int toVersion, int changeIndex);
}
