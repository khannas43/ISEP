package in.gov.dgs.isep.user.config;

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

import java.util.*;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/users/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/users/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/users/**").hasRole("SYSTEM_ADMIN")
                        .anyRequest().denyAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(SecurityConfig::extractKeycloakRealmRoles);
        converter.setPrincipalClaimName("sub");
        return converter;
    }

    private static Collection<GrantedAuthority> extractKeycloakRealmRoles(org.springframework.security.oauth2.jwt.Jwt jwt) {
        Object realmAccessObj = jwt.getClaims().get("realm_access");
        if (!(realmAccessObj instanceof Map<?, ?> realmAccess)) {
            return List.of();
        }
        Object rolesObj = realmAccess.get("roles");
        if (!(rolesObj instanceof Collection<?> roles)) {
            return List.of();
        }
        List<GrantedAuthority> authorities = new ArrayList<>();
        for (Object r : roles) {
            if (r instanceof String role && !role.isBlank()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase(Locale.ROOT)));
            }
        }
        return authorities;
    }
}
