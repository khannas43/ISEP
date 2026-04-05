package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.User;
import in.gov.dgs.isep.meeting.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.UUID;

/**
 * Bulk user import from CSV (SCR-USR-04). CSV columns: email, fullName, designation, organization, systemRole.
 */
@Service
public class UserBulkImportService {

    private final UserRepository userRepository;

    public UserBulkImportService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public static class ValidationResult {
        private List<ValidRow> valid = new ArrayList<>();
        private List<InvalidRow> invalid = new ArrayList<>();

        public List<ValidRow> getValid() { return valid; }
        public void setValid(List<ValidRow> valid) { this.valid = valid; }
        public List<InvalidRow> getInvalid() { return invalid; }
        public void setInvalid(List<InvalidRow> invalid) { this.invalid = invalid; }
    }

    public static class ValidRow {
        private int row;
        private String email;
        private String fullName;
        private String designation;
        private String organization;
        private String systemRole;

        public int getRow() { return row; }
        public void setRow(int row) { this.row = row; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getDesignation() { return designation; }
        public void setDesignation(String designation) { this.designation = designation; }
        public String getOrganization() { return organization; }
        public void setOrganization(String organization) { this.organization = organization; }
        public String getSystemRole() { return systemRole; }
        public void setSystemRole(String systemRole) { this.systemRole = systemRole; }
    }

    public static class InvalidRow {
        private int row;
        private String message;

        public int getRow() { return row; }
        public void setRow(int row) { this.row = row; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public ValidationResult validate(MultipartFile file) {
        ValidationResult result = new ValidationResult();
        if (file == null || file.isEmpty()) {
            InvalidRow err = new InvalidRow();
            err.setRow(0);
            err.setMessage("No file uploaded");
            result.getInvalid().add(err);
            return result;
        }
        Set<String> seenEmails = new HashSet<>();
        Set<String> existingEmails = new HashSet<>(userRepository.findAllEmailsLower());
        int rowNum = 0;
        try (var reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                rowNum++;
                if (rowNum == 1 && line.trim().toLowerCase().startsWith("email")) continue; // skip header
                String[] parts = parseCsvLine(line);
                if (parts.length < 2) {
                    if (line.isBlank()) continue;
                    InvalidRow err = new InvalidRow();
                    err.setRow(rowNum);
                    err.setMessage("Missing email or fullName");
                    result.getInvalid().add(err);
                    continue;
                }
                String email = parts[0].trim();
                String fullName = parts[1].trim();
                String designation = parts.length > 2 ? parts[2].trim() : "";
                String organization = parts.length > 3 ? parts[3].trim() : "";
                String systemRole = parts.length > 4 ? parts[4].trim() : null;

                if (email.isEmpty()) {
                    InvalidRow err = new InvalidRow();
                    err.setRow(rowNum);
                    err.setMessage("Email is required");
                    result.getInvalid().add(err);
                    continue;
                }
                if (fullName.isEmpty()) {
                    InvalidRow err = new InvalidRow();
                    err.setRow(rowNum);
                    err.setMessage("Full name is required");
                    result.getInvalid().add(err);
                    continue;
                }
                if (!email.matches("^[^@]+@[^@]+\\.[^@]+$")) {
                    InvalidRow err = new InvalidRow();
                    err.setRow(rowNum);
                    err.setMessage("Invalid email format");
                    result.getInvalid().add(err);
                    continue;
                }
                if (seenEmails.contains(email.toLowerCase())) {
                    InvalidRow err = new InvalidRow();
                    err.setRow(rowNum);
                    err.setMessage("Duplicate email in file");
                    result.getInvalid().add(err);
                    continue;
                }
                if (existingEmails.contains(email.toLowerCase())) {
                    InvalidRow err = new InvalidRow();
                    err.setRow(rowNum);
                    err.setMessage("Email already exists in system");
                    result.getInvalid().add(err);
                    continue;
                }
                seenEmails.add(email.toLowerCase());
                ValidRow v = new ValidRow();
                v.setRow(rowNum);
                v.setEmail(email);
                v.setFullName(fullName);
                v.setDesignation(designation);
                v.setOrganization(organization);
                v.setSystemRole(systemRole);
                result.getValid().add(v);
            }
        } catch (Exception e) {
            InvalidRow err = new InvalidRow();
            err.setRow(rowNum > 0 ? rowNum : 1);
            err.setMessage("Error reading file: " + e.getMessage());
            result.getInvalid().add(err);
        }
        return result;
    }

    @Transactional
    public int createUsers(List<ValidRow> rows) {
        int created = 0;
        Set<String> existing = new HashSet<>(userRepository.findAllEmailsLower());
        for (ValidRow r : rows) {
            if (existing.contains(r.getEmail().toLowerCase())) continue;
            existing.add(r.getEmail().toLowerCase());
            User u = new User();
            u.setUserId(UUID.randomUUID());
            u.setKeycloakId("import-" + UUID.randomUUID());
            u.setEmail(r.getEmail());
            u.setFullName(r.getFullName());
            u.setDesignation(r.getDesignation() != null && !r.getDesignation().isEmpty() ? r.getDesignation() : null);
            u.setOrganization(r.getOrganization() != null && !r.getOrganization().isEmpty() ? r.getOrganization() : null);
            u.setSystemRole(r.getSystemRole() != null && !r.getSystemRole().isEmpty() ? r.getSystemRole() : null);
            u.setIsActive(true);
            userRepository.save(u);
            created++;
        }
        return created;
    }

    private static String[] parseCsvLine(String line) {
        List<String> out = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if ((c == ',' && !inQuotes) || c == '\t') {
                out.add(cur.toString().trim());
                cur = new StringBuilder();
            } else {
                cur.append(c);
            }
        }
        out.add(cur.toString().trim());
        return out.toArray(String[]::new);
    }
}
