package in.gov.dgs.isep.meeting.web;

/**
 * Request body for PATCH /api/v1/users/{id}. All fields optional; only provided fields are updated.
 */
public class UpdateUserRequest {

    private String fullName;
    private String designation;
    private String organization;
    private String phone;
    private String email;
    private String systemRole;
    private Boolean isActive;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSystemRole() { return systemRole; }
    public void setSystemRole(String systemRole) { this.systemRole = systemRole; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
