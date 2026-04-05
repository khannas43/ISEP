package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.service.UserAssignmentsService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * User list and update API for coordinator dropdown (Add/Edit Agenda Item), Admin user list, edit user.
 * Reads from core.users. PATCH /{id} updates user details (fullName, email, designation, organization, phone, systemRole, isActive).
 */
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserAssignmentsService userAssignmentsService;

    public UserController(UserRepository userRepository, UserAssignmentsService userAssignmentsService) {
        this.userRepository = userRepository;
        this.userAssignmentsService = userAssignmentsService;
    }

    /** List users with optional filters: search (fullName/email), systemRole, activeOnly (true = active only, false/empty = all). When no filters, defaults to active only. */
    @GetMapping
    public Page<UserDto> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String systemRole,
            @RequestParam(required = false) Boolean activeOnly,
            @PageableDefault(size = 100) Pageable pageable
    ) {
        // Only use filter path when at least one meaningful filter is present (avoid empty-string edge cases)
        boolean hasSearch = search != null && !search.isBlank();
        boolean hasRole = systemRole != null && !systemRole.isBlank();
        boolean hasActiveFilter = activeOnly != null;
        boolean useFilterPath = hasSearch || hasRole || hasActiveFilter;

        if (useFilterPath) {
            String searchTrimmed = hasSearch ? search.trim() : null;
            String roleTrimmed = hasRole ? systemRole.trim() : null;
            return userRepository.findWithFilters(searchTrimmed, roleTrimmed, activeOnly, pageable).map(UserDto::from);
        }
        // No filters: default to active users only (same as original behaviour)
        Page<User> page = userRepository.findByIsActiveTrue(pageable);
        return page.map(UserDto::from);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> get(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(UserDto::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Get user's committee (body) and correspondence group assignments (SCR-USR-05). */
    @GetMapping("/{id}/assignments")
    public ResponseEntity<UserAssignmentsDto> getAssignments(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(userAssignmentsService.getAssignments(id));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    /** Set user's committee and correspondence group assignments. Replaces existing assignments. */
    @PutMapping("/{id}/assignments")
    public ResponseEntity<Void> setAssignments(@PathVariable UUID id, @RequestBody SetUserAssignmentsRequest request) {
        try {
            userAssignmentsService.setAssignments(id, request != null ? request : new SetUserAssignmentsRequest());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    /** Update user; only non-null fields in request are applied. Valid system_role values: SYSTEM_ADMIN, IC_DIVISION_HEAD, DELEGATION_LEADER, COORDINATOR, MEMBER, VIEWER. */
    @Transactional
    @PatchMapping("/{id}")
    public ResponseEntity<UserDto> update(@PathVariable UUID id, @RequestBody UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getDesignation() != null) {
            user.setDesignation(request.getDesignation().trim().isEmpty() ? null : request.getDesignation().trim());
        }
        if (request.getOrganization() != null) {
            user.setOrganization(request.getOrganization().trim().isEmpty() ? null : request.getOrganization().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim().isEmpty() ? null : request.getPhone().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim());
        }
        if (request.getSystemRole() != null && !request.getSystemRole().isBlank()) {
            user.setSystemRole(request.getSystemRole().trim());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }
        user = userRepository.save(user);
        return ResponseEntity.ok(UserDto.from(user));
    }
}
