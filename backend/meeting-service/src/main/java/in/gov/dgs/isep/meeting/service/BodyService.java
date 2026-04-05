package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.InternationalBody;
import in.gov.dgs.isep.meeting.domain.InternationalBody.BodyType;
import in.gov.dgs.isep.meeting.repository.InternationalBodyRepository;
import in.gov.dgs.isep.meeting.web.BodyDto;
import in.gov.dgs.isep.meeting.web.CreateBodyRequest;
import in.gov.dgs.isep.meeting.web.UpdateBodyRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class BodyService {

    private final InternationalBodyRepository bodyRepository;

    public BodyService(InternationalBodyRepository bodyRepository) {
        this.bodyRepository = bodyRepository;
    }

    @Transactional(readOnly = true)
    public List<BodyDto> list(UUID parentId, boolean includeInactive) {
        Sort sort = Sort.by("name");
        Stream<InternationalBody> stream = bodyRepository.findAll(sort).stream();
        if (!includeInactive) {
            stream = stream.filter(InternationalBody::getIsActive);
        }
        if (parentId != null) {
            UUID pid = parentId;
            stream = stream.filter(b -> (b.getParentBody() == null && pid == null)
                    || (b.getParentBody() != null && pid.equals(b.getParentBody().getBodyId())));
        }
        return stream.map(BodyDto::from).toList();
    }

    @Transactional(readOnly = true)
    public BodyDto getById(UUID id) {
        InternationalBody b = bodyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Body not found: " + id));
        return BodyDto.from(b);
    }

    @Transactional
    public BodyDto create(CreateBodyRequest req) {
        InternationalBody parent = req.getParentBodyId() != null
                ? bodyRepository.findById(req.getParentBodyId())
                .orElseThrow(() -> new IllegalArgumentException("Parent body not found: " + req.getParentBodyId()))
                : null;
        InternationalBody body = new InternationalBody();
        body.setParentBody(parent);
        body.setName(req.getName().trim());
        body.setAbbreviation(req.getAbbreviation() != null ? req.getAbbreviation().trim() : null);
        body.setBodyType(BodyType.valueOf(req.getBodyType().toUpperCase()));
        body.setDescription(req.getDescription() != null ? req.getDescription().trim() : null);
        body.setIsActive(req.getIsActive() != null ? req.getIsActive() : true);
        body = bodyRepository.save(body);
        return BodyDto.from(body);
    }

    @Transactional
    public BodyDto update(UUID id, UpdateBodyRequest req) {
        InternationalBody body = bodyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Body not found: " + id));
        if (req.getParentBodyId() != null) {
            body.setParentBody(bodyRepository.findById(req.getParentBodyId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent body not found: " + req.getParentBodyId())));
        } else {
            body.setParentBody(null);
        }
        if (req.getName() != null && !req.getName().isBlank()) {
            body.setName(req.getName().trim());
        }
        if (req.getAbbreviation() != null) {
            body.setAbbreviation(req.getAbbreviation().trim().isEmpty() ? null : req.getAbbreviation().trim());
        }
        if (req.getBodyType() != null && !req.getBodyType().isBlank()) {
            body.setBodyType(BodyType.valueOf(req.getBodyType().toUpperCase()));
        }
        if (req.getDescription() != null) {
            body.setDescription(req.getDescription().trim().isEmpty() ? null : req.getDescription().trim());
        }
        if (req.getIsActive() != null) {
            body.setIsActive(req.getIsActive());
        }
        body = bodyRepository.save(body);
        return BodyDto.from(body);
    }
}
