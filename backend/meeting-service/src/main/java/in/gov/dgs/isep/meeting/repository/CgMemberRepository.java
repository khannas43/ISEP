package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.CgMember;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CgMemberRepository extends JpaRepository<CgMember, UUID> {

    List<CgMember> findByUserId(UUID userId);

    Optional<CgMember> findByCgIdAndUserId(UUID cgId, UUID userId);

    void deleteByCgIdAndUserId(UUID cgId, UUID userId);

    void deleteByUserId(UUID userId);
}
