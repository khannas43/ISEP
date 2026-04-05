package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.service.SystemConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * System configuration API (SCR-SYS-03). GET returns full config; PUT saves and audits.
 */
@RestController
@RequestMapping("/api/v1/system")
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    public SystemConfigController(SystemConfigService systemConfigService) {
        this.systemConfigService = systemConfigService;
    }

    @Transactional(readOnly = true)
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        return ResponseEntity.ok(systemConfigService.getConfig());
    }

    @PutMapping("/config")
    public ResponseEntity<Void> saveConfig(
            @RequestBody Map<String, Object> config,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = parseUserId(jwt != null ? jwt.getSubject() : null);
        String userEmail = jwt != null && jwt.getClaim("email") != null ? jwt.getClaimAsString("email") : "system";
        systemConfigService.saveConfig(config, userId, userEmail);
        return ResponseEntity.noContent().build();
    }

    private static UUID parseUserId(String sub) {
        if (sub == null || sub.isBlank()) return null;
        try {
            return UUID.fromString(sub);
        } catch (Exception e) {
            return null;
        }
    }
}
