package in.gov.dgs.isep.document.web;

import in.gov.dgs.isep.document.service.DocumentService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public ResponseEntity<Page<DocumentDto>> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(documentService.list(q, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> get(@PathVariable UUID id) {
        DocumentDto dto = documentService.getById(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @GetMapping(params = "meetingId")
    public ResponseEntity<List<DocumentDto>> listByMeeting(
            @RequestParam UUID meetingId,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(documentService.listByMeeting(meetingId, size));
    }
}
