package in.gov.dgs.isep.meeting.web;

/**
 * REST controller for international bodies (committees, sub-committees, etc.).
 * Base path: /api/v1/bodies. List (optional parentId, includeInactive), get, create, update.
 */
import in.gov.dgs.isep.meeting.service.BodyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bodies")
public class BodyController {

    private final BodyService bodyService;

    public BodyController(BodyService bodyService) {
        this.bodyService = bodyService;
    }

    @GetMapping
    public List<BodyDto> list(
            @RequestParam(required = false) UUID parentId,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive
    ) {
        return bodyService.list(parentId, includeInactive);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BodyDto> get(@PathVariable UUID id) {
        return ResponseEntity.ok(bodyService.getById(id));
    }

    @PostMapping
    public ResponseEntity<BodyDto> create(@Valid @RequestBody CreateBodyRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(bodyService.create(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BodyDto> update(@PathVariable UUID id, @RequestBody UpdateBodyRequest request) {
        try {
            return ResponseEntity.ok(bodyService.update(id, request));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }
}
