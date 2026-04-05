package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.Paper;
import in.gov.dgs.isep.meeting.domain.PaperApprovalStage;
import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.repository.PaperApprovalStageRepository;
import in.gov.dgs.isep.meeting.repository.PaperRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.web.PaperApprovalDto;
import in.gov.dgs.isep.meeting.web.PaperStatusResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class PaperApprovalService {

    private final PaperRepository paperRepository;
    private final PaperApprovalStageRepository stageRepository;
    private final UserRepository userRepository;

    public PaperApprovalService(PaperRepository paperRepository,
                               PaperApprovalStageRepository stageRepository,
                               UserRepository userRepository) {
        this.paperRepository = paperRepository;
        this.stageRepository = stageRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PaperApprovalDto getApproval(UUID paperId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found: " + paperId));
        List<PaperApprovalStage> stages = stageRepository.findByPaperPaperIdOrderByStageNumberAsc(paperId);
        return PaperApprovalDto.from(paperId, paper.getTitle(), stages);
    }

    /**
     * Combined status for approval UI: stages, MoPSW visibility, last action, paper submitted time.
     */
    @Transactional
    public PaperStatusResponse getPaperStatus(UUID paperId) {
        ensureDefaultStages(paperId);
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found: " + paperId));
        List<PaperApprovalStage> stages = stageRepository.findByPaperPaperIdOrderByStageNumberAsc(paperId);
        PaperApprovalDto approval = PaperApprovalDto.from(paperId, paper.getTitle(), stages);
        Instant lastActionAt = null;
        String lastActionBy = null;
        for (PaperApprovalStage s : stages) {
            if (s.getActedAt() != null && (lastActionAt == null || s.getActedAt().isAfter(lastActionAt))) {
                lastActionAt = s.getActedAt();
                lastActionBy = s.getApproverUser() != null ? s.getApproverUser().getFullName() : null;
            }
        }
        boolean mopsw = stages.stream()
                .anyMatch(s -> s.getStageName() != null && s.getStageName().toUpperCase().contains("MOPSW"));
        return PaperStatusResponse.of(
                paper.getTitle(),
                approval.getCurrentStage(),
                mopsw,
                paper.getCreatedAt(),
                lastActionBy,
                lastActionAt,
                approval.getStages()
        );
    }

    @Transactional
    public PaperApprovalDto approve(UUID paperId, UUID userId, String comments) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found: " + paperId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        List<PaperApprovalStage> stages = stageRepository.findByPaperPaperIdOrderByStageNumberAsc(paperId);
        PaperApprovalStage current = stages.stream().filter(s -> "PENDING".equals(s.getStatus())).findFirst()
                .orElseThrow(() -> new RuntimeException("No pending approval stage for paper: " + paperId));
        current.setStatus("APPROVED");
        current.setActedAt(Instant.now());
        current.setComments(comments);
        current.setApproverUser(user);
        stageRepository.save(current);
        return getApproval(paperId);
    }

    @Transactional
    public PaperApprovalDto reject(UUID paperId, UUID userId, String comments) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found: " + paperId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        List<PaperApprovalStage> stages = stageRepository.findByPaperPaperIdOrderByStageNumberAsc(paperId);
        PaperApprovalStage current = stages.stream().filter(s -> "PENDING".equals(s.getStatus())).findFirst()
                .orElseThrow(() -> new RuntimeException("No pending approval stage for paper: " + paperId));
        current.setStatus("REJECTED");
        current.setActedAt(Instant.now());
        current.setComments(comments != null && !comments.isBlank() ? comments : "Rejected");
        current.setApproverUser(user);
        stageRepository.save(current);
        paper.setStatus("REJECTED");
        paperRepository.save(paper);
        return getApproval(paperId);
    }

    /**
     * Move paper from DRAFT into approval; creates default stages when missing.
     */
    @Transactional
    public PaperApprovalDto submitForApproval(UUID paperId, UUID userId) {
        if (userId == null) {
            throw new RuntimeException("User not authenticated");
        }
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found: " + paperId));
        String st = paper.getStatus() != null ? paper.getStatus() : "";
        if (!"DRAFT".equalsIgnoreCase(st)) {
            throw new RuntimeException("Only DRAFT papers can be submitted for approval");
        }
        ensureDefaultStages(paperId);
        paper.setStatus("IN_APPROVAL");
        paperRepository.save(paper);
        return getApproval(paperId);
    }

    /**
     * Papers currently in approval where the first pending stage matches one of the user's realm roles
     * (Coordinator → COORDINATOR, Delegation Leader → DELEGATION_LEADER, Division Head → IC_DIVISION_HEAD).
     */
    @Transactional(readOnly = true)
    public List<Paper> listPapersAwaitingMyApproval(Collection<String> realmRoles) {
        if (realmRoles == null || realmRoles.isEmpty()) {
            return List.of();
        }
        List<Paper> out = new ArrayList<>();
        for (Paper p : paperRepository.findAll()) {
            String ps = p.getStatus() != null ? p.getStatus().toUpperCase(Locale.ROOT) : "";
            if ("DRAFT".equals(ps) || "FINALIZED".equals(ps) || "REJECTED".equals(ps)) {
                continue;
            }
            List<PaperApprovalStage> stages = stageRepository.findByPaperPaperIdOrderByStageNumberAsc(p.getPaperId());
            if (stages.isEmpty()) {
                continue;
            }
            PaperApprovalStage pending = stages.stream()
                    .filter(s -> "PENDING".equals(s.getStatus()))
                    .findFirst()
                    .orElse(null);
            if (pending == null || pending.getStageName() == null) {
                continue;
            }
            if (stageMatchesRealmRole(pending.getStageName(), realmRoles)) {
                out.add(p);
            }
        }
        return out;
    }

    private static boolean stageMatchesRealmRole(String stageName, Collection<String> realmRoles) {
        String n = stageName.trim();
        if (n.equalsIgnoreCase("Coordinator")) {
            return realmRoles.stream().anyMatch(r -> "COORDINATOR".equalsIgnoreCase(r));
        }
        if (n.equalsIgnoreCase("Delegation Leader")) {
            return realmRoles.stream().anyMatch(r -> "DELEGATION_LEADER".equalsIgnoreCase(r));
        }
        if (n.equalsIgnoreCase("Division Head")) {
            return realmRoles.stream().anyMatch(r -> "IC_DIVISION_HEAD".equalsIgnoreCase(r));
        }
        return false;
    }

    /** Ensure a default approval pipeline exists for a paper (e.g. Coordinator → DL → IH). */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void ensureDefaultStages(UUID paperId) {
        if (!stageRepository.findByPaperPaperIdOrderByStageNumberAsc(paperId).isEmpty()) {
            return;
        }
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new RuntimeException("Paper not found: " + paperId));
        for (int i = 1; i <= 3; i++) {
            PaperApprovalStage stage = new PaperApprovalStage();
            stage.setPaper(paper);
            stage.setStageNumber(i);
            stage.setStageName(i == 1 ? "Coordinator" : i == 2 ? "Delegation Leader" : "Division Head");
            stage.setStatus(i == 1 ? "PENDING" : "PENDING");
            stageRepository.save(stage);
        }
    }
}
