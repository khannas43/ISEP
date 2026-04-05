package in.gov.dgs.isep.user.web;

import in.gov.dgs.isep.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Page<UserDto> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String systemRole,
            @RequestParam(required = false) Boolean activeOnly,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return userService.search(search, systemRole, activeOnly, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> get(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    public ResponseEntity<UserDto> create(
            @Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID createdBy = parseUserId(jwt != null ? jwt.getSubject() : null);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request, createdBy));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        try {
            return ResponseEntity.ok(userService.update(id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        userService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    private static UUID parseUserId(String sub) {
        if (sub == null || sub.isBlank()) return null;
        try {
            if (sub.length() == 32 && !sub.contains("-")) {
                return UUID.fromString(sub.replaceFirst("(\\w{8})(\\w{4})(\\w{4})(\\w{4})(\\w{12})", "$1-$2-$3-$4-$5"));
            }
            return UUID.fromString(sub);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
