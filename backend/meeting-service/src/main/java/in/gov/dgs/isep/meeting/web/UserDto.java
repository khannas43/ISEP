package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.User;

import java.util.UUID;

/**
 * DTO for user list (coordinator dropdown, Admin user list).
 * Compatible with frontend UserDto shape.
 */
public record UserDto(
    UUID userId,
    String keycloakId,
    String email,
    String fullName,
    String designation,
    String organization,
    String phone,
    String systemRole,
    boolean isActive
) {
    public static UserDto from(User u) {
        return new UserDto(
            u.getUserId(),
            u.getKeycloakId(),
            u.getEmail(),
            u.getFullName(),
            u.getDesignation(),
            u.getOrganization(),
            u.getPhone(),
            u.getSystemRole() != null ? u.getSystemRole() : "",
            Boolean.TRUE.equals(u.getIsActive())
        );
    }
}
