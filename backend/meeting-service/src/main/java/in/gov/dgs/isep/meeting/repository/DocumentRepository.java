package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

    List<Document> findByMeetingMeetingIdOrderByUploadedAtDesc(UUID meetingId);

    Page<Document> findByMeetingMeetingIdOrderByUploadedAtDesc(UUID meetingId, Pageable pageable);

    Page<Document> findAllByOrderByUploadedAtDesc(Pageable pageable);

    @Query("SELECT d FROM Document d WHERE LOWER(d.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(COALESCE(d.fileName, '')) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY d.uploadedAt DESC")
    Page<Document> searchByTitleOrFileName(@Param("q") String q, Pageable pageable);

    Optional<Document> findByDocumentIdAndAgendaItem_AgendaItemId(UUID documentId, UUID agendaItemId);
}
