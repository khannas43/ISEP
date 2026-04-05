package in.gov.dgs.isep.meeting.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.gov.dgs.isep.meeting.domain.Paper;
import in.gov.dgs.isep.meeting.repository.PaperRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Paper draft load/save for SCR-PAPER-02. One canonical draft per paper;
 * all reviewers and admin see the same content (GET) and persist changes (PUT).
 */
@Service
public class PaperService {

    private final PaperRepository paperRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PaperService(PaperRepository paperRepository) {
        this.paperRepository = paperRepository;
    }

    @Transactional(readOnly = true)
    public PaperDraft getDraft(UUID paperId) {
        return paperRepository.findById(paperId)
                .map(this::toDraft)
                .orElse(null);
    }

    @Transactional
    public PaperDraft saveDraft(UUID paperId, Object content, Integer clientVersion, UUID lastModifiedBy) {
        Paper paper = paperRepository.findById(paperId).orElse(null);
        if (paper == null) {
            paper = new Paper();
            paper.setPaperId(paperId);
            paper.setTitle("Untitled paper");
            paper.setStatus("DRAFT");
        }
        if (clientVersion != null && paper.getDraftVersion() != clientVersion) {
            throw new ConcurrentModificationException("Draft was modified elsewhere; refresh and try again.");
        }
        String contentJson;
        if (content instanceof String s) {
            contentJson = s;
        } else {
            try {
                contentJson = objectMapper.writeValueAsString(content);
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Invalid draft content", e);
            }
        }
        paper.setDraftContent(contentJson);
        paper.setDraftVersion(paper.getDraftVersion() + 1);
        paper.setDraftSavedAt(Instant.now());
        paper.setDraftLastModifiedBy(lastModifiedBy);
        paperRepository.save(paper);
        return toDraft(paper);
    }

    private PaperDraft toDraft(Paper p) {
        Object content = null;
        if (p.getDraftContent() != null && !p.getDraftContent().isBlank()) {
            try {
                content = objectMapper.readValue(p.getDraftContent(), Object.class);
            } catch (JsonProcessingException e) {
                content = Map.of("type", "doc", "content", Map.of("text", p.getDraftContent()));
            }
        }
        return new PaperDraft(
                content,
                p.getDraftVersion(),
                p.getDraftSavedAt() != null ? p.getDraftSavedAt().toString() : null,
                p.getDraftLastModifiedBy() != null ? p.getDraftLastModifiedBy().toString() : null
        );
    }

    public record PaperDraft(Object content, int version, String savedAt, String lastModifiedBy) {}

    @SuppressWarnings("serial")
    public static class ConcurrentModificationException extends RuntimeException {
        public ConcurrentModificationException(String message) {
            super(message);
        }
    }
}
