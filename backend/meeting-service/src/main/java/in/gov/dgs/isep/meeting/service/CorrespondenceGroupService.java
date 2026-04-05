package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.CorrespondenceGroup;
import in.gov.dgs.isep.meeting.domain.InternationalBody;
import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.repository.CorrespondenceGroupRepository;
import in.gov.dgs.isep.meeting.repository.InternationalBodyRepository;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import in.gov.dgs.isep.meeting.web.CorrespondenceGroupDto;
import in.gov.dgs.isep.meeting.web.CreateCorrespondenceGroupRequest;
import in.gov.dgs.isep.meeting.web.UpdateCorrespondenceGroupRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.StreamSupport;

@Service
public class CorrespondenceGroupService {

    private final CorrespondenceGroupRepository cgRepository;
    private final InternationalBodyRepository bodyRepository;
    private final UserRepository userRepository;

    public CorrespondenceGroupService(CorrespondenceGroupRepository cgRepository,
                                     InternationalBodyRepository bodyRepository,
                                     UserRepository userRepository) {
        this.cgRepository = cgRepository;
        this.bodyRepository = bodyRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CorrespondenceGroupDto> list(UUID bodyId) {
        if (bodyId != null) {
            return cgRepository.findByParentBodyBodyIdOrderByNameAsc(bodyId)
                    .stream().map(CorrespondenceGroupDto::from).toList();
        }
        return StreamSupport.stream(cgRepository.findAll(Sort.by("name")).spliterator(), false)
                .map(CorrespondenceGroupDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CorrespondenceGroupDto getById(UUID id) {
        CorrespondenceGroup cg = cgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Correspondence group not found: " + id));
        return CorrespondenceGroupDto.from(cg);
    }

    @Transactional
    public CorrespondenceGroupDto create(CreateCorrespondenceGroupRequest req) {
        InternationalBody body = bodyRepository.findById(req.getParentBodyId())
                .orElseThrow(() -> new RuntimeException("Body not found: " + req.getParentBodyId()));
        CorrespondenceGroup cg = new CorrespondenceGroup();
        cg.setParentBody(body);
        cg.setName(req.getName().trim());
        cg.setMandate(req.getMandate());
        cg.setStartDate(req.getStartDate());
        cg.setEndDate(req.getEndDate());
        cg.setStatus(req.getStatus() != null && !req.getStatus().isBlank() ? req.getStatus() : "ACTIVE");
        cg.setImsoReference(req.getImsoReference());
        if (req.getIndiaLeadId() != null && userRepository.existsById(req.getIndiaLeadId())) {
            cg.setIndiaLead(userRepository.getReferenceById(req.getIndiaLeadId()));
        }
        cg = cgRepository.save(cg);
        return CorrespondenceGroupDto.from(cg);
    }

    @Transactional
    public CorrespondenceGroupDto update(UUID id, UpdateCorrespondenceGroupRequest req) {
        CorrespondenceGroup cg = cgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Correspondence group not found: " + id));
        if (req.getParentBodyId() != null) {
            InternationalBody body = bodyRepository.findById(req.getParentBodyId())
                    .orElseThrow(() -> new RuntimeException("Body not found: " + req.getParentBodyId()));
            cg.setParentBody(body);
        }
        if (req.getName() != null && !req.getName().isBlank()) cg.setName(req.getName().trim());
        if (req.getMandate() != null) cg.setMandate(req.getMandate());
        if (req.getStartDate() != null) cg.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) cg.setEndDate(req.getEndDate());
        if (req.getStatus() != null && !req.getStatus().isBlank()) cg.setStatus(req.getStatus());
        if (req.getImsoReference() != null) cg.setImsoReference(req.getImsoReference());
        if (req.getIndiaLeadId() != null) {
            if (userRepository.existsById(req.getIndiaLeadId())) {
                cg.setIndiaLead(userRepository.getReferenceById(req.getIndiaLeadId()));
            }
        }
        cg = cgRepository.save(cg);
        return CorrespondenceGroupDto.from(cg);
    }
}
