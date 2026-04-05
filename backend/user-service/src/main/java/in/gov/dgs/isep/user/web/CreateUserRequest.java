package in.gov.dgs.isep.user.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class CreateUserRequest {

    @NotBlank(message = "Keycloak ID is required")
    private String keycloakId;

    @NotBlank(message = "Email is required")
    @Email
    private String email;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String designation;
    private String organization;
    private String phone;

    @NotNull(message = "System role is required")
    @Pattern(regexp = "SYSTEM_ADMIN|IC_DIVISION_HEAD|DELEGATION_LEADER|COORDINATOR|MEMBER|VIEWER", message = "Invalid system role")
    private String systemRole;

    private Boolean isActive = true;

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
}
