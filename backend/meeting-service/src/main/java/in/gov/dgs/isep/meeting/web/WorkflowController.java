package in.gov.dgs.isep.meeting.web;

import in.gov.dgs.isep.meeting.domain.WorkflowInstance;
import in.gov.dgs.isep.meeting.repository.WorkflowInstanceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Workflow API (ACT-B09): list workflow instances. Full FSM/Celery escalation in Python later.
 */
@RestController
@RequestMapping("/api/v1/workflow-instances")
public class WorkflowController {

    private final WorkflowInstanceRepository workflowInstanceRepository;

    public WorkflowController(WorkflowInstanceRepository workflowInstanceRepository) {
        this.workflowInstanceRepository = workflowInstanceRepository;
    }

    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<Page<Map<String, Object>>> list(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<WorkflowInstance> page = workflowInstanceRepository.findAllByOrderByCreatedAtDesc(pageable);
        return ResponseEntity.ok(page.map(this::toDto));
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable UUID id) {
        return workflowInstanceRepository.findById(id)
                .map(w -> ResponseEntity.ok(toDto(w)))
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toDto(WorkflowInstance w) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("workflowId", w.getWorkflowId());
        dto.put("workflowType", w.getWorkflowType());
        dto.put("currentState", w.getCurrentState());
        dto.put("previousState", w.getPreviousState());
        dto.put("documentId", w.getDocument() != null ? w.getDocument().getDocumentId() : null);
        dto.put("initiatedAt", w.getInitiatedAt());
        dto.put("completedAt", w.getCompletedAt());
        dto.put("deadline", w.getDeadline());
        dto.put("createdAt", w.getCreatedAt());
        return dto;
    }
}
