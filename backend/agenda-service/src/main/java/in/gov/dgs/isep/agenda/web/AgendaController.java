package in.gov.dgs.isep.agenda.web;

import in.gov.dgs.isep.agenda.domain.AgendaItem;
import in.gov.dgs.isep.agenda.repository.AgendaItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/meetings/{meetingId}/agenda-items")
public class AgendaController {

    private final AgendaItemRepository repository;

    public AgendaController(AgendaItemRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<AgendaItemDto>> list(@PathVariable UUID meetingId) {
        List<AgendaItemDto> list = repository.findByMeetingIdOrderByItemNumberAsc(meetingId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<AgendaItemDto> get(@PathVariable UUID meetingId, @PathVariable UUID itemId) {
        return repository.findById(itemId)
                .filter(a -> a.getMeetingId().equals(meetingId))
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private AgendaItemDto toDto(AgendaItem a) {
        AgendaItemDto dto = new AgendaItemDto();
        dto.setAgendaItemId(a.getAgendaItemId());
        dto.setMeetingId(a.getMeetingId());
        dto.setItemNumber(a.getItemNumber());
        dto.setTitle(a.getTitle());
        dto.setDescription(a.getDescription());
        dto.setCategory(a.getCategory());
        dto.setPriority(a.getPriority());
        dto.setStatus(a.getStatus());
        dto.setDeadlineForInputs(a.getDeadlineForInputs());
        dto.setAssignedCoordinatorId(a.getAssignedCoordinatorId());
        return dto;
    }
}
