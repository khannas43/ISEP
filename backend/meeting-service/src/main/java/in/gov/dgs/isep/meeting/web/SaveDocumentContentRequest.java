package in.gov.dgs.isep.meeting.web;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;

/**
 * PUT /api/v1/documents/{id}/content — TipTap auto-save payload.
 */
public class SaveDocumentContentRequest {

    private String contentHtml;

    private JsonNode contentJson;

    /** Base64-encoded Y.js state (optional until Layer 3). */
    private String ydocState;

    @NotNull
    private Integer version;

    public String getContentHtml() { return contentHtml; }
    public void setContentHtml(String contentHtml) { this.contentHtml = contentHtml; }
    public JsonNode getContentJson() { return contentJson; }
    public void setContentJson(JsonNode contentJson) { this.contentJson = contentJson; }
    public String getYdocState() { return ydocState; }
    public void setYdocState(String ydocState) { this.ydocState = ydocState; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}
