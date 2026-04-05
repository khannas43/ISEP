package in.gov.dgs.isep.document.repository;

import in.gov.dgs.isep.document.domain.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

    List<Document> findByMeetingIdOrderByUploadedAtDesc(UUID meetingId, Pageable pageable);

    List<Document> findByMeetingIdAndAgendaItemId(UUID meetingId, UUID agendaItemId);

    @Query("SELECT d FROM Document d WHERE (:q IS NULL OR :q = '' OR LOWER(d.title) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Document> search(@Param("q") String q, Pageable pageable);
}
