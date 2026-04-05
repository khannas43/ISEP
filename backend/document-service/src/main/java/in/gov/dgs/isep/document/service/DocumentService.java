package in.gov.dgs.isep.document.service;

import in.gov.dgs.isep.document.domain.Document;
import in.gov.dgs.isep.document.repository.DocumentRepository;
import in.gov.dgs.isep.document.web.DocumentDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Transactional(readOnly = true)
    public Page<DocumentDto> list(String q, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<Document> pageResult = (q != null && !q.isBlank())
                ? documentRepository.search(q.trim(), pageable)
                : documentRepository.findAll(pageable);
        return pageResult.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public DocumentDto getById(UUID id) {
        return documentRepository.findById(id)
                .map(this::toDto)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> listByMeeting(UUID meetingId, int limit) {
        return documentRepository.findByMeetingIdOrderByUploadedAtDesc(meetingId, PageRequest.of(0, limit))
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private DocumentDto toDto(Document d) {
        DocumentDto dto = new DocumentDto();
        dto.setDocumentId(d.getDocumentId());
        dto.setMeetingId(d.getMeetingId());
        dto.setAgendaItemId(d.getAgendaItemId());
        dto.setBodyId(d.getBodyId());
        dto.setDocumentType(d.getDocumentType());
        dto.setTitle(d.getTitle());
        dto.setSource(d.getSource());
        dto.setFileName(d.getFileName());
        dto.setFileSizeBytes(d.getFileSizeBytes());
        dto.setMimeType(d.getMimeType());
        dto.setCurrentVersion(d.getCurrentVersion());
        dto.setStatus(d.getStatus());
        dto.setUploadedAt(d.getUploadedAt());
        dto.setUploadedBy(d.getUploadedBy());
        return dto;
    }
}
