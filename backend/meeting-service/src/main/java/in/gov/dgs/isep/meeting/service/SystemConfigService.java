package in.gov.dgs.isep.meeting.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.gov.dgs.isep.meeting.domain.AuditLog;
import in.gov.dgs.isep.meeting.domain.SystemConfig;
import in.gov.dgs.isep.meeting.repository.AuditLogRepository;
import in.gov.dgs.isep.meeting.repository.SystemConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

/**
 * Platform-wide system configuration (SCR-SYS-03). Single key "app" holds full JSON; changes audited.
 */
@Service
public class SystemConfigService {

    private static final String CONFIG_KEY_APP = "app";
    private final SystemConfigRepository systemConfigRepository;
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SystemConfigService(SystemConfigRepository systemConfigRepository,
                               AuditLogRepository auditLogRepository) {
        this.systemConfigRepository = systemConfigRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getConfig() {
        return systemConfigRepository.findByConfigKey(CONFIG_KEY_APP)
                .map(sc -> parseConfigJson(sc.getConfigValue()))
                .orElseGet(SystemConfigService::defaultConfig);
    }

    @Transactional
    public void saveConfig(Map<String, Object> config, UUID userId, String userEmail) {
        Map<String, Object> merged = new LinkedHashMap<>(defaultConfig());
        if (config != null) deepMerge(merged, config);
        String newJson = toJson(merged);
        Optional<SystemConfig> existing = systemConfigRepository.findByConfigKey(CONFIG_KEY_APP);
        String oldJson = existing.map(SystemConfig::getConfigValue).orElse(null);

        SystemConfig entity = existing.orElseGet(() -> {
            SystemConfig e = new SystemConfig();
            e.setConfigKey(CONFIG_KEY_APP);
            return e;
        });
        entity.setConfigValue(newJson);
        entity.setUpdatedAt(Instant.now());
        entity.setUpdatedBy(userId);
        systemConfigRepository.save(entity);

        AuditLog audit = new AuditLog();
        audit.setTimestamp(Instant.now());
        audit.setUserId(userId);
        audit.setUserEmail(userEmail);
        audit.setActionType("CONFIG_UPDATE");
        audit.setEntityType("SYSTEM_CONFIG");
        audit.setEntityId(CONFIG_KEY_APP);
        audit.setDescription("System configuration updated");
        audit.setBeforeState(oldJson);
        audit.setAfterState(newJson);
        auditLogRepository.save(audit);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseConfigJson(String json) {
        if (json == null || json.isBlank()) return defaultConfig();
        try {
            Map<String, Object> map = objectMapper.readValue(json, Map.class);
            return map.isEmpty() ? defaultConfig() : map;
        } catch (JsonProcessingException e) {
            return defaultConfig();
        }
    }

    private String toJson(Map<String, Object> config) {
        try {
            return objectMapper.writeValueAsString(config);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize config", e);
        }
    }

    @SuppressWarnings("unchecked")
    private static void deepMerge(Map<String, Object> target, Map<String, Object> source) {
        for (Map.Entry<String, Object> e : source.entrySet()) {
            Object srcVal = e.getValue();
            if (srcVal instanceof Map && target.get(e.getKey()) instanceof Map) {
                deepMerge((Map<String, Object>) target.get(e.getKey()), (Map<String, Object>) srcVal);
            } else if (srcVal != null) {
                target.put(e.getKey(), srcVal);
            }
        }
    }

    private static Map<String, Object> defaultConfig() {
        Map<String, Object> def = new LinkedHashMap<>();
        def.put("general", Map.of("platformName", "ISEP", "contactEmail", "admin@example.org"));
        def.put("session", Map.of("inactivityTimeoutMinutes", 30, "mfaRequired", true));
        def.put("notifications", Map.of("smtpHost", "smtp.example.org", "defaultDigest", "daily"));
        def.put("storage", Map.of("minioQuotaGb", 100, "retentionDays", 365));
        def.put("workflow", Map.of("approvalDeadlineDefaultHours", 72, "escalationGraceHours", 24));
        def.put("security", Map.of("passwordMinLength", 12, "allowedIpRanges", ""));
        return def;
    }
}
