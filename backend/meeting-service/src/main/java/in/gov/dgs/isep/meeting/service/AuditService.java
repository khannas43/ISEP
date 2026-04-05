package in.gov.dgs.isep.meeting.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.gov.dgs.isep.meeting.domain.AuditLog;
import in.gov.dgs.isep.meeting.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void log(
            UUID userId,
            String userRole,
            String actionType,
            String entityType,
            UUID entityId,
            String ipAddress,
            String deviceType,
            String userAgent,
            String outcome,
            Map<String, Object> details) {
        AuditLog row = new AuditLog();
        row.setTimestamp(Instant.now());
        row.setUserId(userId);
        row.setActionType(actionType);
        row.setEntityType(entityType);
        row.setEntityId(entityId != null ? entityId.toString() : null);
        row.setIpAddress(ipAddress);
        row.setDeviceType(deviceType);
        row.setUserAgent(userAgent);
        row.setDescription(actionType + " " + entityType + (outcome != null ? " " + outcome : ""));
        try {
            row.setAfterState(details != null ? objectMapper.writeValueAsString(details) : null);
        } catch (JsonProcessingException e) {
            row.setAfterState("{}");
        }
        auditLogRepository.save(row);
    }
}
