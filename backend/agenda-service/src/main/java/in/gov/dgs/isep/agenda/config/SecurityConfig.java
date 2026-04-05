package in.gov.dgs.isep.agenda.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
        http.csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers("/api/v1/**").authenticated()
                        .anyRequest().denyAll())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter c = new JwtAuthenticationConverter();
        c.setJwtGrantedAuthoritiesConverter(SecurityConfig::extractRoles);
        c.setPrincipalClaimName("sub");
        return c;
    }

    private static Collection<GrantedAuthority> extractRoles(org.springframework.security.oauth2.jwt.Jwt jwt) {
        Object ra = jwt.getClaims().get("realm_access");
        if (!(ra instanceof Map<?, ?> m)) return List.of();
        Object r = m.get("roles");
        if (!(r instanceof Collection<?> roles)) return List.of();
        List<GrantedAuthority> out = new ArrayList<>();
        for (Object o : roles) {
            if (o instanceof String s && !s.isBlank())
                out.add(new SimpleGrantedAuthority("ROLE_" + s.toUpperCase(Locale.ROOT)));
        }
        return out;
    }
}
