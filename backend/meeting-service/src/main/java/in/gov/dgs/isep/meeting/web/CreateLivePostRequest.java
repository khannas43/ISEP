package in.gov.dgs.isep.meeting.web;

import jakarta.validation.constraints.NotBlank;

public record CreateLivePostRequest(
        @NotBlank String content,
        String postType
) {}
