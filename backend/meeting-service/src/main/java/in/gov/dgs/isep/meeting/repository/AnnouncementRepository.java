package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {

    Page<Announcement> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
