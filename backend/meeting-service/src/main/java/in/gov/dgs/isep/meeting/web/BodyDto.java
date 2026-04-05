package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.InternationalBody;

import java.time.Instant;
import java.util.UUID;

public class BodyDto {

    private UUID bodyId;
    private UUID parentBodyId;
    private String parentBodyName;
    private String name;
    private String abbreviation;
    private String bodyType;
    private String description;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public static BodyDto from(InternationalBody b) {
        BodyDto dto = new BodyDto();
        dto.bodyId = b.getBodyId();
        dto.parentBodyId = b.getParentBody() != null ? b.getParentBody().getBodyId() : null;
        dto.parentBodyName = b.getParentBody() != null ? b.getParentBody().getName() : null;
        dto.name = b.getName();
        dto.abbreviation = b.getAbbreviation();
        dto.bodyType = b.getBodyType().name();
        dto.description = b.getDescription();
        dto.isActive = b.getIsActive();
        dto.createdAt = b.getCreatedAt();
        dto.updatedAt = b.getUpdatedAt();
        return dto;
    }

    public UUID getBodyId() { return bodyId; }
    public void setBodyId(UUID bodyId) { this.bodyId = bodyId; }
    public UUID getParentBodyId() { return parentBodyId; }
    public void setParentBodyId(UUID parentBodyId) { this.parentBodyId = parentBodyId; }
    public String getParentBodyName() { return parentBodyName; }
    public void setParentBodyName(String parentBodyName) { this.parentBodyName = parentBodyName; }
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
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
