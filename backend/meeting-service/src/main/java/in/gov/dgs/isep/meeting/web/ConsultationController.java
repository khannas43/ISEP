package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.service.ConsultationService;
import in.gov.dgs.isep.meeting.web.ConsultationDtos.ConsultationResponseDto;
import in.gov.dgs.isep.meeting.web.ConsultationDtos.ExternalAgencyCandidateDto;
import in.gov.dgs.isep.meeting.web.ConsultationDtos.SendConsultationRequest;
import in.gov.dgs.isep.meeting.web.ConsultationDtos.SubmitFeedbackRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * External agency consultation (Phase 4): send clean copy to ministries, list status, submit feedback.
 */
@RestController
@RequestMapping("/api/v1")
public class ConsultationController {

    private final ConsultationService consultationService;
    private final UserRepository userRepository;

    public ConsultationController(ConsultationService consultationService, UserRepository userRepository) {
        this.consultationService = consultationService;
        this.userRepository = userRepository;
    }

    private static boolean hasAnyRole(Authentication authentication, String... roles) {
        if (authentication == null) return false;
        for (GrantedAuthority a : authentication.getAuthorities()) {
            String auth = a.getAuthority();
            for (String r : roles) {
                if (("ROLE_" + r).equals(auth)) {
                    return true;
                }
            }
        }
        return false;
    }

    private UUID requireUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return userRepository
                .resolveJwtSubjectToUserId(jwt.getSubject(), jwt.getClaimAsString("preferred_username"))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));
    }

    @PostMapping("/documents/{documentId}/consultations")
    public ResponseEntity<ConsultationResponseDto> sendForConsultation(
            @PathVariable UUID documentId,
            @RequestBody SendConsultationRequest request,
            Authentication authentication) {
        if (!hasAnyRole(authentication, "SYSTEM_ADMIN", "DELEGATION_LEADER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        UUID userId = requireUserId(authentication);
        ConsultationResponseDto dto = consultationService.sendForConsultation(documentId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/documents/{documentId}/consultations")
    public ResponseEntity<List<ConsultationResponseDto>> listForDocument(
            @PathVariable UUID documentId,
            Authentication authentication) {
        UUID userId = requireUserId(authentication);
        return ResponseEntity.ok(consultationService.listForDocument(documentId, userId));
    }

    @PostMapping("/consultations/{consultationId}/feedback")
    public ResponseEntity<Void> submitFeedback(
            @PathVariable UUID consultationId,
            @RequestBody SubmitFeedbackRequest request,
            Authentication authentication) {
        UUID userId = requireUserId(authentication);
        consultationService.submitFeedback(consultationId, request, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/consultations/external-agency-candidates")
    public ResponseEntity<List<ExternalAgencyCandidateDto>> externalCandidates(Authentication authentication) {
        if (!hasAnyRole(authentication, "SYSTEM_ADMIN", "DELEGATION_LEADER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        requireUserId(authentication);
        return ResponseEntity.ok(consultationService.listExternalAgencyCandidates());
    }
}
