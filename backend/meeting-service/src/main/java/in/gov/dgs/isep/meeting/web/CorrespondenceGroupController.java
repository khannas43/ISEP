package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.service.CorrespondenceGroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/correspondence-groups")
public class CorrespondenceGroupController {

    private final CorrespondenceGroupService correspondenceGroupService;

    public CorrespondenceGroupController(CorrespondenceGroupService correspondenceGroupService) {
        this.correspondenceGroupService = correspondenceGroupService;
    }

    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<List<CorrespondenceGroupDto>> list(
            @RequestParam(required = false) UUID bodyId
    ) {
        return ResponseEntity.ok(correspondenceGroupService.list(bodyId));
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}")
    public ResponseEntity<CorrespondenceGroupDto> get(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(correspondenceGroupService.getById(id));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }

    @PostMapping
    public ResponseEntity<CorrespondenceGroupDto> create(
            @Valid @RequestBody CreateCorrespondenceGroupRequest request
    ) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(correspondenceGroupService.create(request));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.badRequest().build();
            }
            throw e;
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CorrespondenceGroupDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCorrespondenceGroupRequest request
    ) {
        try {
            return ResponseEntity.ok(correspondenceGroupService.update(id, request));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            throw e;
        }
    }
}
