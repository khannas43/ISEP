package in.gov.dgs.isep.meeting.domain;

import jakarta.persistence.*;

/**
 * Lookup values for dropdowns (project ground rule: all options from DB).
 * Table: core.reference_data
 */
@Entity
@Table(name = "reference_data", schema = "core")
@IdClass(ReferenceDataId.class)
public class ReferenceData {

    @Id
    @Column(name = "category", length = 80, nullable = false)
    private String category;

    @Id
    @Column(name = "code", length = 80, nullable = false)
    private String code;

    @Column(name = "label", nullable = false, length = 255)
    private String label;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    public ReferenceData() {}

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
