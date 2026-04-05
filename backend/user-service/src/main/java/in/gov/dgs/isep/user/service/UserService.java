package in.gov.dgs.isep.user.service;

import in.gov.dgs.isep.user.domain.User;
import in.gov.dgs.isep.user.repository.UserRepository;
import in.gov.dgs.isep.user.web.CreateUserRequest;
import in.gov.dgs.isep.user.web.UpdateUserRequest;
import in.gov.dgs.isep.user.web.UserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<UserDto> search(String search, String systemRole, Boolean activeOnly, Pageable pageable) {
        return userRepository.search(
                search != null && !search.isBlank() ? search.trim() : null,
                systemRole != null && !systemRole.isBlank() ? systemRole : null,
                activeOnly,
                pageable
        ).map(UserDto::from);
    }

    @Transactional(readOnly = true)
    public UserDto findById(UUID id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        if (u.getDeletedAt() != null) {
            throw new RuntimeException("User not found: " + id);
        }
        return UserDto.from(u);
    }

    @Transactional
    public UserDto create(CreateUserRequest req, UUID createdBy) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with email already exists: " + req.getEmail());
        }
        if (userRepository.findByKeycloakId(req.getKeycloakId()).isPresent()) {
            throw new IllegalArgumentException("User with Keycloak ID already exists: " + req.getKeycloakId());
        }
        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setKeycloakId(req.getKeycloakId());
        user.setEmail(req.getEmail().trim());
        user.setFullName(req.getFullName().trim());
        user.setDesignation(req.getDesignation() != null ? req.getDesignation().trim() : null);
        user.setOrganization(req.getOrganization() != null ? req.getOrganization().trim() : null);
        user.setPhone(req.getPhone() != null ? req.getPhone().trim() : null);
        user.setSystemRole(req.getSystemRole());
        user.setIsActive(req.getIsActive() != null ? req.getIsActive() : true);
        user.setCreatedBy(createdBy);
        user = userRepository.save(user);
        return UserDto.from(user);
    }

    @Transactional
    public UserDto update(UUID id, UpdateUserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        if (user.getDeletedAt() != null) {
            throw new RuntimeException("User not found: " + id);
        }
        if (req.getFullName() != null) user.setFullName(req.getFullName().trim());
        if (req.getDesignation() != null) user.setDesignation(req.getDesignation().trim());
        if (req.getOrganization() != null) user.setOrganization(req.getOrganization().trim());
        if (req.getPhone() != null) user.setPhone(req.getPhone().trim());
        if (req.getEmail() != null) user.setEmail(req.getEmail().trim());
        if (req.getSystemRole() != null) user.setSystemRole(req.getSystemRole());
        if (req.getIsActive() != null) user.setIsActive(req.getIsActive());
        user = userRepository.save(user);
        return UserDto.from(user);
    }

    @Transactional
    public void deactivate(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setIsActive(false);
        userRepository.save(user);
    }
}
