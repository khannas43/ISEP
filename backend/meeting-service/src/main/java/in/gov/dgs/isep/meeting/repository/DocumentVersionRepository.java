package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, UUID> {

    List<DocumentVersion> findByDocumentDocumentIdOrderByVersionNumberDesc(UUID documentId);

    Optional<DocumentVersion> findByDocumentDocumentIdAndVersionNumber(UUID documentId, int versionNumber);
}
