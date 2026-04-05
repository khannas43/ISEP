package in.gov.dgs.isep.meeting.service;

import com.github.difflib.DiffUtils;
import com.github.difflib.patch.AbstractDelta;
import com.github.difflib.patch.DeltaType;
import com.github.difflib.patch.Patch;
import in.gov.dgs.isep.meeting.domain.Document;
import in.gov.dgs.isep.meeting.domain.DocumentVersion;
import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.domain.VersionChangeDecision;
import in.gov.dgs.isep.meeting.repository.DocumentRepository;
import in.gov.dgs.isep.meeting.repository.DocumentVersionRepository;
import in.gov.dgs.isep.meeting.repository.MeetingParticipantRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.repository.VersionChangeDecisionRepository;
import in.gov.dgs.isep.meeting.web.CleanCopyRequest;
import in.gov.dgs.isep.meeting.web.CleanCopyResponse;
import in.gov.dgs.isep.meeting.web.DecisionRecordDto;
import in.gov.dgs.isep.meeting.web.DiffChunkDto;
import in.gov.dgs.isep.meeting.web.DiffDecisionRequest;
import in.gov.dgs.isep.meeting.web.DiffResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.jsoup.Jsoup;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.HexFormat;

@Service
public class DocumentDiffService {

    private static final String TYPE_UNCHANGED = "UNCHANGED";
    private static final String TYPE_INSERTED = "INSERTED";
    private static final String TYPE_DELETED = "DELETED";

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final VersionChangeDecisionRepository decisionRepository;
    private final UserRepository userRepository;
    private final MeetingParticipantRepository participantRepository;
    private final AuditService auditService;

    public DocumentDiffService(
            DocumentRepository documentRepository,
            DocumentVersionRepository documentVersionRepository,
            VersionChangeDecisionRepository decisionRepository,
            UserRepository userRepository,
            MeetingParticipantRepository participantRepository,
            AuditService auditService) {
        this.documentRepository = documentRepository;
        this.documentVersionRepository = documentVersionRepository;
        this.decisionRepository = decisionRepository;
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public DiffResponse getDiff(UUID documentId, int fromVersion, int toVersion, UUID userId, boolean systemAdmin) {
        Document doc = loadDocument(documentId);
        assertCanAccess(doc, userId, systemAdmin);
        if (fromVersion >= toVersion) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fromVersion must be less than toVersion");
        }
        DocumentVersion fromV = loadVersionRow(documentId, fromVersion);
        DocumentVersion toV = loadVersionRow(documentId, toVersion);
        String fromHtml = fromV.getContentHtml() != null ? fromV.getContentHtml() : "";
        String toHtml = toV.getContentHtml() != null ? toV.getContentHtml() : "";
        List<DiffChunkDto> chunks = buildChunks(fromHtml, toHtml, toV);
        Map<Integer, String> decisions = loadDecisionsMap(documentId, fromVersion, toVersion);
        List<DiffChunkDto> annotated = chunks.stream()
                .map(c -> new DiffChunkDto(
                        c.changeIndex(),
                        c.type(),
                        c.text(),
                        c.author(),
                        c.authorName(),
                        c.timestamp(),
                        decisions.get(c.changeIndex())
                ))
                .toList();
        return new DiffResponse(
                documentId,
                fromVersion,
                toVersion,
                fromV.getUploadedAt(),
                toV.getUploadedAt(),
                annotated
        );
    }

    private Map<Integer, String> loadDecisionsMap(UUID documentId, int fromVersion, int toVersion) {
        List<VersionChangeDecision> rows = decisionRepository
                .findByDocumentDocumentIdAndFromVersionAndToVersion(documentId, fromVersion, toVersion);
        Map<Integer, String> m = new HashMap<>();
        for (VersionChangeDecision r : rows) {
            m.put(r.getChangeIndex(), r.getDecision());
        }
        return m;
    }

    private List<DiffChunkDto> buildChunks(String fromHtml, String toHtml, DocumentVersion toVersion) {
        String fromPlain = htmlToPlain(fromHtml);
        String toPlain = htmlToPlain(toHtml);
        List<String> orig = tokenize(fromPlain);
        List<String> rev = tokenize(toPlain);
        Patch<String> patch = DiffUtils.diff(orig, rev);
        List<DiffChunkDto> out = new ArrayList<>();
        int origPos = 0;
        int changeIndex = 0;
        UUID authorId = toVersion.getUploadedBy() != null ? toVersion.getUploadedBy().getUserId() : null;
        String authorName = toVersion.getUploadedBy() != null ? toVersion.getUploadedBy().getFullName() : null;
        Instant ts = toVersion.getUploadedAt();

        for (AbstractDelta<String> delta : patch.getDeltas()) {
            int origStart = delta.getSource().getPosition();
            if (origPos < origStart) {
                String t = joinWords(orig, origPos, origStart);
                if (!t.isEmpty()) {
                    out.add(new DiffChunkDto(changeIndex++, TYPE_UNCHANGED, t, null, null, null, null));
                }
                origPos = origStart;
            }
            DeltaType type = delta.getType();
            if (type == DeltaType.DELETE) {
                String t = joinLines(delta.getSource().getLines());
                if (!t.isEmpty()) {
                    out.add(new DiffChunkDto(changeIndex++, TYPE_DELETED, t, authorId, authorName, ts, null));
                }
                origPos += delta.getSource().getLines().size();
            } else if (type == DeltaType.INSERT) {
                String t = joinLines(delta.getTarget().getLines());
                if (!t.isEmpty()) {
                    out.add(new DiffChunkDto(changeIndex++, TYPE_INSERTED, t, authorId, authorName, ts, null));
                }
            } else if (type == DeltaType.CHANGE) {
                String tDel = joinLines(delta.getSource().getLines());
                String tIns = joinLines(delta.getTarget().getLines());
                if (!tDel.isEmpty()) {
                    out.add(new DiffChunkDto(changeIndex++, TYPE_DELETED, tDel, authorId, authorName, ts, null));
                }
                if (!tIns.isEmpty()) {
                    out.add(new DiffChunkDto(changeIndex++, TYPE_INSERTED, tIns, authorId, authorName, ts, null));
                }
                origPos += delta.getSource().getLines().size();
            }
        }
        if (origPos < orig.size()) {
            String t = joinWords(orig, origPos, orig.size());
            if (!t.isEmpty()) {
                out.add(new DiffChunkDto(changeIndex, TYPE_UNCHANGED, t, null, null, null, null));
            }
        }
        return out;
    }

    private static String joinLines(List<String> lines) {
        if (lines == null || lines.isEmpty()) return "";
        return String.join(" ", lines);
    }

    private static String joinWords(List<String> words, int from, int to) {
        if (from >= to || words.isEmpty()) return "";
        return String.join(" ", words.subList(from, to));
    }

    private static List<String> tokenize(String plain) {
        if (plain == null || plain.isBlank()) return new ArrayList<>();
        String[] parts = plain.trim().split("\\s+");
        List<String> list = new ArrayList<>(parts.length);
        for (String p : parts) {
            if (!p.isEmpty()) list.add(p);
        }
        return list;
    }

    static String htmlToPlain(String html) {
        if (html == null || html.isBlank()) return "";
        return Jsoup.parse(html).text();
    }

    @Transactional
    public DecisionRecordDto recordDecision(
            UUID documentId,
            DiffDecisionRequest req,
            UUID userId,
            HttpServletRequest httpRequest
    ) {
        Document doc = loadDocument(documentId);
        assertCanAccess(doc, userId, false);
        if (!"ACCEPTED".equals(req.getDecision()) && !"REJECTED".equals(req.getDecision())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "decision must be ACCEPTED or REJECTED");
        }
        User decider = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));
        VersionChangeDecision row = decisionRepository
                .findByDocumentDocumentIdAndFromVersionAndToVersionAndChangeIndex(
                        documentId, req.getFromVersion(), req.getToVersion(), req.getChangeIndex())
                .orElseGet(VersionChangeDecision::new);
        row.setDocument(doc);
        row.setFromVersion(req.getFromVersion());
        row.setToVersion(req.getToVersion());
        row.setChangeIndex(req.getChangeIndex());
        row.setDecision(req.getDecision());
        row.setDecidedBy(decider);
        row.setDecidedAt(Instant.now());
        row = decisionRepository.save(row);

        try {
            auditService.log(
                    userId,
                    null,
                    "ACCEPTED".equals(req.getDecision()) ? "APPROVE" : "REJECT",
                    "DocumentVersion",
                    documentId,
                    httpRequest != null ? httpRequest.getRemoteAddr() : null,
                    null,
                    httpRequest != null ? httpRequest.getHeader("User-Agent") : null,
                    "SUCCESS",
                    Map.of(
                            "changeIndex", req.getChangeIndex(),
                            "fromVersion", req.getFromVersion(),
                            "toVersion", req.getToVersion(),
                            "decision", req.getDecision()
                    )
            );
        } catch (Exception ignored) {
            // non-fatal
        }

        return new DecisionRecordDto(
                row.getId(),
                documentId,
                row.getFromVersion(),
                row.getToVersion(),
                row.getChangeIndex(),
                row.getDecision(),
                decider.getUserId(),
                row.getDecidedAt()
        );
    }

    @Transactional
    public CleanCopyResponse generateCleanCopy(
            UUID documentId,
            CleanCopyRequest req,
            String jwtSubject,
            String preferredUsername,
            boolean bypassMeetingParticipantGate,
            HttpServletRequest httpRequest
    ) {
        UUID userId = userRepository.resolveJwtSubjectToUserId(jwtSubject, preferredUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Document doc = loadDocument(documentId);
        assertCanAccess(doc, userId, bypassMeetingParticipantGate);
        int fromVn = req.getFromVersion();
        int toVn = req.getToVersion();
        if (fromVn >= toVn) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fromVersion must be less than toVersion");
        }
        DocumentVersion fromRow = loadVersionRow(documentId, fromVn);
        DocumentVersion toRow = loadVersionRow(documentId, toVn);
        String fromHtml = fromRow.getContentHtml() != null ? fromRow.getContentHtml() : "";
        String toHtml = toRow.getContentHtml() != null ? toRow.getContentHtml() : "";
        List<DiffChunkDto> chunks = buildChunks(fromHtml, toHtml, toRow);
        Map<Integer, String> decisions = loadDecisionsMap(documentId, fromVn, toVn);

        String strategy = req.getStrategy();
        String finalPlain = switch (strategy) {
            case "ACCEPT_ALL" -> applyStrategy(chunks, decisions, Strategy.ACCEPT_ALL);
            case "REJECT_ALL" -> applyStrategy(chunks, decisions, Strategy.REJECT_ALL);
            case "USE_DECISIONS" -> applyStrategy(chunks, decisions, Strategy.USE_DECISIONS);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid strategy");
        };

        String finalHtml = plainToMinimalHtml(finalPlain);
        User saver = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));

        int current = doc.getCurrentVersion() != null ? doc.getCurrentVersion() : 1;
        int nextVer = current + 1;
        String checksum = sha256Hex(finalHtml.getBytes(StandardCharsets.UTF_8));

        DocumentVersion snap = new DocumentVersion();
        snap.setDocument(doc);
        snap.setVersionNumber(nextVer);
        snap.setContentHtml(finalHtml);
        snap.setContentJson(null);
        snap.setYdocState(null);
        snap.setMinioObjectKey("editor/clean-copy/" + documentId + "/v" + nextVer);
        snap.setUploadedBy(saver);
        snap.setUploadedAt(Instant.now());
        snap.setChangeSummary("Clean copy: " + strategy + " from v" + fromVn + " vs v" + toVn);
        snap.setFileSizeBytes((long) finalHtml.getBytes(StandardCharsets.UTF_8).length);
        snap.setChecksumSha256(checksum);
        documentVersionRepository.save(snap);

        doc.setContentHtml(finalHtml);
        doc.setContentJson(null);
        doc.setYdocState(null);
        doc.setCurrentVersion(nextVer);
        doc.setStatus("CLEAN_COPY");
        documentRepository.save(doc);

        try {
            auditService.log(
                    userId,
                    null,
                    "APPROVE",
                    "Document",
                    documentId,
                    httpRequest != null ? httpRequest.getRemoteAddr() : null,
                    null,
                    httpRequest != null ? httpRequest.getHeader("User-Agent") : null,
                    "SUCCESS",
                    Map.of("strategy", strategy, "fromVersion", fromVn, "toVersion", toVn, "newVersion", nextVer)
            );
        } catch (Exception ignored) {
            // non-fatal
        }

        return new CleanCopyResponse(documentId, nextVer, "CLEAN_COPY", snap.getUploadedAt());
    }

    private enum Strategy { ACCEPT_ALL, REJECT_ALL, USE_DECISIONS }

    private String applyStrategy(List<DiffChunkDto> chunks, Map<Integer, String> decisions, Strategy strategy) {
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for (DiffChunkDto c : chunks) {
            String t = c.text();
            if (t == null || t.isEmpty()) continue;
            switch (c.type()) {
                case TYPE_UNCHANGED -> {
                    if (!first) sb.append(' ');
                    sb.append(t);
                    first = false;
                }
                case TYPE_INSERTED -> {
                    boolean include = switch (strategy) {
                        case ACCEPT_ALL -> true;
                        case REJECT_ALL -> false;
                        case USE_DECISIONS -> {
                            String d = decisions.get(c.changeIndex());
                            yield d == null || "ACCEPTED".equals(d);
                        }
                    };
                    if (include) {
                        if (!first) sb.append(' ');
                        sb.append(t);
                        first = false;
                    }
                }
                case TYPE_DELETED -> {
                    boolean include = switch (strategy) {
                        case ACCEPT_ALL -> false;
                        case REJECT_ALL -> true;
                        case USE_DECISIONS -> {
                            String d = decisions.get(c.changeIndex());
                            yield "REJECTED".equals(d);
                        }
                    };
                    if (include) {
                        if (!first) sb.append(' ');
                        sb.append(t);
                        first = false;
                    }
                }
                default -> { }
            }
        }
        return sb.toString();
    }

    private static String plainToMinimalHtml(String plain) {
        if (plain == null || plain.isBlank()) return "<p></p>";
        String esc = plain
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
        String[] paras = esc.split("\\n\\s*\\n");
        StringBuilder html = new StringBuilder();
        for (String p : paras) {
            String line = p.replace('\n', ' ').trim();
            if (line.isEmpty()) continue;
            html.append("<p>").append(line).append("</p>");
        }
        if (html.isEmpty()) return "<p></p>";
        return html.toString();
    }

    private Document loadDocument(UUID documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
    }

    private DocumentVersion loadVersionRow(UUID documentId, int versionNumber) {
        return documentVersionRepository.findByDocumentDocumentIdAndVersionNumber(documentId, versionNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found"));
    }

    private void assertCanAccess(Document doc, UUID userId, boolean systemAdmin) {
        if (systemAdmin) {
            return;
        }
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        if (doc.getMeeting() == null) {
            if (doc.getUploadedBy() != null && userId.equals(doc.getUploadedBy().getUserId())) {
                return;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to access this document");
        }
        UUID meetingId = doc.getMeeting().getMeetingId();
        if (participantRepository.existsByMeetingMeetingIdAndUserUserId(meetingId, userId)) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a meeting participant");
    }

    private static String sha256Hex(byte[] bytes) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            return "0".repeat(64);
        }
    }
}
