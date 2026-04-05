package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByKeycloakId(String keycloakId);

    /**
     * Map JWT to {@code core.users.user_id}: {@code keycloak_id} may store Keycloak UUID or username
     * (e.g. {@code preferred_username}); {@code sub} is tried first, then UUID-as-primary-key.
     */
    default Optional<UUID> resolveJwtSubjectToUserId(String jwtSubject, String preferredUsername) {
        if (jwtSubject != null && !jwtSubject.isBlank()) {
            Optional<User> bySub = findByKeycloakId(jwtSubject);
            if (bySub.isPresent()) {
                return Optional.of(bySub.get().getUserId());
            }
            try {
                UUID asUuid = UUID.fromString(jwtSubject);
                Optional<User> byPk = findById(asUuid);
                if (byPk.isPresent()) {
                    return Optional.of(byPk.get().getUserId());
                }
            } catch (IllegalArgumentException ignored) {
                // continue
            }
        }
        if (preferredUsername != null && !preferredUsername.isBlank()) {
            return findByKeycloakId(preferredUsername).map(User::getUserId);
        }
        return Optional.empty();
    }

    Page<User> findByIsActiveTrue(Pageable pageable);

    /**
     * Filter users by optional search (fullName, email), systemRole, and activeOnly.
     * search: optional, matches fullName or email (case-insensitive contains).
     * systemRole: optional, exact match on system_role.
     * activeOnly: when true, only is_active = true; when false or null, no active filter.
     */
    @Query("SELECT u FROM User u WHERE " +
            "(:search IS NULL OR :search = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:systemRole IS NULL OR :systemRole = '' OR u.systemRole = :systemRole) " +
            "AND (:activeOnly IS NULL OR :activeOnly = false OR u.isActive = true)")
    Page<User> findWithFilters(@Param("search") String search, @Param("systemRole") String systemRole, @Param("activeOnly") Boolean activeOnly, Pageable pageable);

    @Query("SELECT LOWER(u.email) FROM User u")
    java.util.List<String> findAllEmailsLower();
}
