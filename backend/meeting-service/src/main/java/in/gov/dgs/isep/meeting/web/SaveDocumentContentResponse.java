package in.gov.dgs.isep.meeting.web;

import java.time.Instant;

public record SaveDocumentContentResponse(int version, Instant savedAt) {}
