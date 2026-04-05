package in.gov.dgs.isep.meeting.web;

import java.util.UUID;

public class UpdateBodyRequest {

    private UUID parentBodyId;
    private String name;
    private String abbreviation;
    private String bodyType;
    private String description;
    private Boolean isActive;

    public UUID getParentBodyId() { return parentBodyId; }
    public void setParentBodyId(UUID parentBodyId) { this.parentBodyId = parentBodyId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAbbreviation() { return abbreviation; }
    public void setAbbreviation(String abbreviation) { this.abbreviation = abbreviation; }
    public String getBodyType() { return bodyType; }
    public void setBodyType(String bodyType) { this.bodyType = bodyType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
