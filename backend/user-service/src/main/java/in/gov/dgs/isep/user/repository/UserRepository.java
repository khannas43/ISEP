package in.gov.dgs.isep.user.repository;

import in.gov.dgs.isep.user.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByKeycloakId(String keycloakId);

    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND " +
           "(:search IS NULL OR :search = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:systemRole IS NULL OR :systemRole = '' OR u.systemRole = :systemRole) " +
           "AND (:activeOnly IS NULL OR :activeOnly = false OR u.isActive = true)")
    Page<User> search(
            @Param("search") String search,
            @Param("systemRole") String systemRole,
            @Param("activeOnly") Boolean activeOnly,
            Pageable pageable
    );
}
