package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.ReferenceData;
import in.gov.dgs.isep.meeting.repository.ReferenceDataRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Reference/lookup data for dropdowns (project ground rule: all options from DB).
 * GET /api/v1/reference?category=meeting_type | meeting_status | body_type | filter_year | etc.
 */
@RestController
@RequestMapping("/api/v1/reference")
public class ReferenceController {

    private final ReferenceDataRepository referenceDataRepository;

    public ReferenceController(ReferenceDataRepository referenceDataRepository) {
        this.referenceDataRepository = referenceDataRepository;
    }

    @GetMapping
    public ResponseEntity<List<ReferenceItemDto>> list(@RequestParam String category) {
        if (category == null || category.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        List<ReferenceData> list = referenceDataRepository.findByCategoryAndIsActiveTrueOrderBySortOrderAsc(category.trim());
        List<ReferenceItemDto> body = list.stream()
            .map(r -> new ReferenceItemDto(r.getCode(), r.getLabel(), r.getSortOrder()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(body);
    }
}
