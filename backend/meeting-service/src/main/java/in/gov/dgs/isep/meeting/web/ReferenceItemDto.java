package in.gov.dgs.isep.meeting.web;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ReferenceItemDto(
    String code,
    String label,
    @JsonProperty("sort_order") int sortOrder
) {}
