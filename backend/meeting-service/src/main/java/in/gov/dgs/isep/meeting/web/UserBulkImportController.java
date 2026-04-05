package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.service.UserBulkImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Bulk user import from CSV (SCR-USR-04). Validate returns valid/invalid rows; confirm creates users.
 */
@RestController
@RequestMapping("/api/v1/users")
public class UserBulkImportController {

    private final UserBulkImportService bulkImportService;

    public UserBulkImportController(UserBulkImportService bulkImportService) {
        this.bulkImportService = bulkImportService;
    }

    @PostMapping("/bulk-import/validate")
    public ResponseEntity<UserBulkImportService.ValidationResult> validate(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(bulkImportService.validate(file));
    }

    @PostMapping("/bulk-import/confirm")
    public ResponseEntity<Map<String, Object>> confirm(
            @RequestBody List<UserBulkImportService.ValidRow> rows
    ) {
        int created = bulkImportService.createUsers(rows != null ? rows : List.of());
        return ResponseEntity.ok(Map.of("created", created));
    }
}
