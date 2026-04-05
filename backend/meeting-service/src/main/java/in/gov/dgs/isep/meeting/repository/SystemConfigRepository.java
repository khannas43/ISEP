package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.SystemConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {

    Optional<SystemConfig> findByConfigKey(String configKey);
}
