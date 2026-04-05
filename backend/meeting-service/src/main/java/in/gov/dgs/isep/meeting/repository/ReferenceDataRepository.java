package in.gov.dgs.isep.meeting.repository;

import in.gov.dgs.isep.meeting.domain.ReferenceData;
import in.gov.dgs.isep.meeting.domain.ReferenceDataId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReferenceDataRepository extends JpaRepository<ReferenceData, ReferenceDataId> {

    List<ReferenceData> findByCategoryAndIsActiveTrueOrderBySortOrderAsc(String category);
}
