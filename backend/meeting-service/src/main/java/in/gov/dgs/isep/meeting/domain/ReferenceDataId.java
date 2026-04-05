package in.gov.dgs.isep.meeting.domain;

import java.io.Serializable;
import java.util.Objects;

public class ReferenceDataId implements Serializable {

    private String category;
    private String code;

    public ReferenceDataId() {}
    public ReferenceDataId(String category, String code) {
        this.category = category;
        this.code = code;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReferenceDataId that = (ReferenceDataId) o;
        return Objects.equals(category, that.category) && Objects.equals(code, that.code);
    }

    @Override
    public int hashCode() {
        return Objects.hash(category, code);
    }
}
