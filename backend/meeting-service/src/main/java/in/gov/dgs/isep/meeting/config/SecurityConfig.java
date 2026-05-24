package in.gov.dgs.isep.meeting.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.*;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                        // Bodies management: admin write, authenticated read (SCR-BODY-01/02/03)
                        .requestMatchers(HttpMethod.POST, "/api/v1/bodies/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/bodies/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/bodies/**").hasRole("SYSTEM_ADMIN")
                        // Meeting update: same roles as frontend Edit button (SCR-MTG); include IC_DIVISION_HEAD
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/meetings/**").hasAnyRole("SYSTEM_ADMIN", "COORDINATOR", "IC_DIVISION_HEAD")
                        .requestMatchers(HttpMethod.POST, "/api/v1/correspondence-groups/**").hasAnyRole("SYSTEM_ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/correspondence-groups/**").hasAnyRole("SYSTEM_ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/users/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/users/bulk-import/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/*/assignments").hasAnyRole("SYSTEM_ADMIN", "IC_DIVISION_HEAD", "COORDINATOR")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/*/assignments").hasAnyRole("SYSTEM_ADMIN", "IC_DIVISION_HEAD", "COORDINATOR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/reports/audit").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/reports/audit").authenticated()
                        .requestMatchers("/api/v1/reports/**").hasAnyRole("SYSTEM_ADMIN", "IC_DIVISION_HEAD")
                        .requestMatchers("/api/v1/system/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers("/api/v1/announcements/**").hasRole("SYSTEM_ADMIN")
                        // Enforce roles at HTTP layer. @PreAuthorize on these paths was denying valid JWTs
                        // with 403 + WWW-Authenticate insufficient_scope (method-security evaluation issue).
                        .requestMatchers(HttpMethod.POST, "/api/v1/meetings/*/agenda/*/documents/upload")
                                .hasAnyRole("SYSTEM_ADMIN", "DELEGATION_LEADER", "COORDINATOR", "MEMBER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/tasks")
                                .hasAnyRole("SYSTEM_ADMIN", "DELEGATION_LEADER", "COORDINATOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/tasks/team", "/api/v1/tasks/team/export")
                                .hasAnyRole("SYSTEM_ADMIN", "DELEGATION_LEADER", "COORDINATOR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/documents/*/diff/decisions")
                                .hasAnyRole("SYSTEM_ADMIN", "IC_DIVISION_HEAD", "DELEGATION_LEADER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/documents/*/content")
                                .hasAnyRole("SYSTEM_ADMIN", "DELEGATION_LEADER", "COORDINATOR", "MEMBER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/documents/*/clean-copy")
                                .hasAnyRole("SYSTEM_ADMIN", "IC_DIVISION_HEAD", "DELEGATION_LEADER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/documents/*/consultations")
                                .hasAnyRole("SYSTEM_ADMIN", "DELEGATION_LEADER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/consultations/external-agency-candidates")
                                .hasAnyRole("SYSTEM_ADMIN", "DELEGATION_LEADER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/papers/*/workflow/submit")
                                .hasAnyRole("SYSTEM_ADMIN", "DELEGATION_LEADER", "COORDINATOR", "MEMBER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/meetings/*/feedback/archive")
                                .hasAnyRole("SYSTEM_ADMIN", "IC_DIVISION_HEAD", "DELEGATION_LEADER", "COORDINATOR")
                        .requestMatchers(HttpMethod.POST, "/api/v1/meetings/*/mom/generate")
                                .hasAnyRole("SYSTEM_ADMIN", "IC_DIVISION_HEAD", "DELEGATION_LEADER", "COORDINATOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/meetings/*/mom", "/api/v1/meetings/*/mom/export")
                                .authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/meetings/*/analytics", "/api/v1/meetings/*/analytics/export")
                                .hasAnyRole("SYSTEM_ADMIN", "IC_DIVISION_HEAD", "DELEGATION_LEADER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/meetings/*/live/stream")
                                .authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/meetings/*/live/agenda/*/posts")
                                .authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/meetings/*/live/agenda/*/posts")
                                .authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/meetings/*/live/activate")
                                .hasAnyRole("SYSTEM_ADMIN", "DELEGATION_LEADER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/meetings/*/live/agenda/*/lock")
                                .hasAnyRole("SYSTEM_ADMIN", "DELEGATION_LEADER")
                        .requestMatchers("/api/v1/**").authenticated()
                        .anyRequest().denyAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(SecurityConfig::extractKeycloakRealmRoles);
        jwtAuthenticationConverter.setPrincipalClaimName("sub");
        return jwtAuthenticationConverter;
    }

    private static Collection<GrantedAuthority> extractKeycloakRealmRoles(org.springframework.security.oauth2.jwt.Jwt jwt) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter scopes =
                new org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter();
        Collection<GrantedAuthority> fromScope = scopes.convert(jwt);
        if (fromScope != null) {
            authorities.addAll(fromScope);
        }

        Object realmAccessObj = jwt.getClaims().get("realm_access");
        if (!(realmAccessObj instanceof Map<?, ?> realmAccess)) {
            return authorities.isEmpty() ? List.of() : authorities;
        }
        Object rolesObj = realmAccess.get("roles");
        Collection<?> roleCollection;
        if (rolesObj instanceof Collection<?> c) {
            roleCollection = c;
        } else if (rolesObj instanceof Object[] arr) {
            roleCollection = Arrays.asList(arr);
        } else if (rolesObj instanceof String[] arr) {
            roleCollection = Arrays.asList(arr);
        } else {
            return authorities.isEmpty() ? List.of() : authorities;
        }
        for (Object r : roleCollection) {
            if (r instanceof String role && !role.isBlank()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase(Locale.ROOT)));
            }
        }
        return authorities;
    }
}
