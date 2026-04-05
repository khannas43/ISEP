package in.gov.dgs.isep.user.web;

import in.gov.dgs.isep.user.domain.User;

import java.time.Instant;
import java.util.UUID;

public class UserDto {

    private UUID userId;
    private String keycloakId;
    private String email;
    private String fullName;
    private String designation;
    private String organization;
    private String phone;
    private String systemRole;
    private Boolean isActive;
    private Boolean mfaEnabled;
    private Instant lastLoginAt;
    private Instant createdAt;
    private Instant updatedAt;

    public static UserDto from(User u) {
        UserDto dto = new UserDto();
        dto.userId = u.getUserId();
        dto.keycloakId = u.getKeycloakId();
        dto.email = u.getEmail();
        dto.fullName = u.getFullName();
        dto.designation = u.getDesignation();
        dto.organization = u.getOrganization();
        dto.phone = u.getPhone();
        dto.systemRole = u.getSystemRole();
        dto.isActive = u.getIsActive();
        dto.mfaEnabled = u.getMfaEnabled();
        dto.lastLoginAt = u.getLastLoginAt();
        dto.createdAt = u.getCreatedAt();
        dto.updatedAt = u.getUpdatedAt();
        return dto;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getKeycloakId() { return keycloakId; }
    public void setKeycloakId(String keycloakId) { this.keycloakId = keycloakId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getSystemRole() { return systemRole; }
    public void setSystemRole(String systemRole) { this.systemRole = systemRole; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
    public Boolean getMfaEnabled() { return mfaEnabled; }
    public void setMfaEnabled(Boolean mfaEnabled) { this.mfaEnabled = mfaEnabled; }
    public Instant getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(Instant lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
