package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.*;
import in.gov.dgs.isep.meeting.repository.*;
import in.gov.dgs.isep.meeting.web.UserAssignmentsDto;
import in.gov.dgs.isep.meeting.web.SetUserAssignmentsRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * User committee (body) and correspondence group assignments (SCR-USR-05).
 */
@Service
public class UserAssignmentsService {

    private final UserRepository userRepository;
    private final InternationalBodyRepository bodyRepository;
    private final CorrespondenceGroupRepository cgRepository;
    private final UserBodyAssignmentRepository userBodyAssignmentRepository;
    private final CgMemberRepository cgMemberRepository;

    public UserAssignmentsService(UserRepository userRepository,
                                  InternationalBodyRepository bodyRepository,
                                  CorrespondenceGroupRepository cgRepository,
                                  UserBodyAssignmentRepository userBodyAssignmentRepository,
                                  CgMemberRepository cgMemberRepository) {
        this.userRepository = userRepository;
        this.bodyRepository = bodyRepository;
        this.cgRepository = cgRepository;
        this.userBodyAssignmentRepository = userBodyAssignmentRepository;
        this.cgMemberRepository = cgMemberRepository;
    }

    @Transactional(readOnly = true)
    public UserAssignmentsDto getAssignments(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Set<UUID> assignedBodyIds = userBodyAssignmentRepository.findByUserIdOrderByBodyId(userId)
                .stream().map(UserBodyAssignment::getBodyId).collect(Collectors.toSet());
        Set<UUID> assignedCgIds = cgMemberRepository.findByUserId(userId)
                .stream().map(CgMember::getCgId).collect(Collectors.toSet());

        List<InternationalBody> allBodies = bodyRepository.findByIsActiveTrueOrderByName();
        List<UserAssignmentsDto.BodyAssignmentItemDto> bodies = allBodies.stream()
                .map(b -> {
                    UserAssignmentsDto.BodyAssignmentItemDto dto = new UserAssignmentsDto.BodyAssignmentItemDto();
                    dto.setBodyId(b.getBodyId());
                    dto.setName(b.getName());
                    dto.setAbbreviation(b.getAbbreviation());
                    dto.setAssigned(assignedBodyIds.contains(b.getBodyId()));
                    return dto;
                })
                .toList();

        List<CorrespondenceGroup> allCgs = cgRepository.findAll(org.springframework.data.domain.Sort.by("name"));
        List<UserAssignmentsDto.CgAssignmentItemDto> cgs = allCgs.stream()
                .map(cg -> {
                    UserAssignmentsDto.CgAssignmentItemDto dto = new UserAssignmentsDto.CgAssignmentItemDto();
                    dto.setCgId(cg.getCgId());
                    dto.setName(cg.getName());
                    if (cg.getParentBody() != null) {
                        dto.setParentBodyId(cg.getParentBody().getBodyId());
                        dto.setParentBodyName(cg.getParentBody().getName());
                    }
                    dto.setAssigned(assignedCgIds.contains(cg.getCgId()));
                    return dto;
                })
                .toList();

        UserAssignmentsDto result = new UserAssignmentsDto();
        result.setUserId(userId);
        result.setUserName(user.getFullName());
        result.setBodies(bodies);
        result.setCorrespondenceGroups(cgs);
        return result;
    }

    @Transactional
    public void setAssignments(UUID userId, SetUserAssignmentsRequest request) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found: " + userId);
        }

        List<UUID> bodyIds = request.getBodyIds() != null ? request.getBodyIds() : List.of();
        List<UUID> cgIds = request.getCgIds() != null ? request.getCgIds() : List.of();

        Set<UUID> validBodyIds = bodyRepository.findByIsActiveTrueOrderByName()
                .stream().map(InternationalBody::getBodyId).collect(Collectors.toSet());
        Set<UUID> validCgIds = cgRepository.findAll()
                .stream().map(CorrespondenceGroup::getCgId).collect(Collectors.toSet());

        bodyIds = bodyIds.stream().filter(validBodyIds::contains).distinct().toList();
        cgIds = cgIds.stream().filter(validCgIds::contains).distinct().toList();

        userBodyAssignmentRepository.deleteByUserId(userId);
        cgMemberRepository.deleteByUserId(userId);
        userBodyAssignmentRepository.flush();
        cgMemberRepository.flush();

        User userRef = userRepository.getReferenceById(userId);
        for (UUID bodyId : bodyIds) {
            UserBodyAssignment uba = new UserBodyAssignment();
            uba.setUser(userRef);
            uba.setBody(bodyRepository.getReferenceById(bodyId));
            userBodyAssignmentRepository.save(uba);
        }

        for (UUID cgId : cgIds) {
            CgMember m = new CgMember();
            m.setUser(userRef);
            m.setCorrespondenceGroup(cgRepository.getReferenceById(cgId));
            m.setRole("Member");
            cgMemberRepository.save(m);
        }
    }
}
