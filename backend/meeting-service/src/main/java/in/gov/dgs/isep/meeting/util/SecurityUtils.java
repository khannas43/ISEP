package in.gov.dgs.isep.meeting.util;

import in.gov.dgs.isep.meeting.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    /**
     * Maps JWT to {@code core.users.user_id} (Keycloak {@code sub} and/or {@code preferred_username}
     * vs {@code keycloak_id}). Prefer this over {@link #getUserId} for FKs into {@code core.users}.
     */
    public static UUID resolveInternalUserId(Authentication auth, UserRepository userRepository) {
        if (userRepository == null || !(auth instanceof JwtAuthenticationToken jwt)) {
            return null;
        }
        String sub = jwt.getToken().getSubject();
        String preferred = jwt.getToken().getClaimAsString("preferred_username");
        return userRepository.resolveJwtSubjectToUserId(sub, preferred).orElse(null);
    }

    public static UUID getUserId(Authentication auth) {
        if (auth instanceof JwtAuthenticationToken jwt) {
            String sub = jwt.getToken().getSubject();
            if (sub == null) return null;
            try {
                return UUID.fromString(sub);
            } catch (IllegalArgumentException e) {
                return null;
            }
        }
        return null;
    }

    public static String getRole(Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) return "";
        return auth.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .map(a -> a.startsWith("ROLE_") ? a.substring(5) : a)
                .orElse("");
    }
}
