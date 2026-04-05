package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Key-value store for platform-wide configuration (SCR-SYS-03).
 * Changes should be audited at the service layer.
 */
@Entity
@Table(name = "system_config", schema = "core")
public class SystemConfig {

    @Id
    @Column(name = "config_key", length = 100)
    private String configKey;

    @Column(name = "config_value", columnDefinition = "TEXT", nullable = false)
    private String configValue;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @PrePersist
    @PreUpdate
    void touch() {
        if (updatedAt == null) updatedAt = Instant.now();
    }

    public String getConfigKey() { return configKey; }
    public void setConfigKey(String configKey) { this.configKey = configKey; }
    public String getConfigValue() { return configValue; }
    public void setConfigValue(String configValue) { this.configValue = configValue; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }
}
