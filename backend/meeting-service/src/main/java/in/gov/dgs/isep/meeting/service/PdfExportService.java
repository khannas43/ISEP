package in.gov.dgs.isep.meeting.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class PdfExportService {

    private static final float MARGIN = 50f;
    private static final float LEADING = 14f;
    private static final float FONT_SIZE = 11f;
    private static final float MIN_Y = MARGIN + LEADING;
    private static final int MAX_CHARS = 90;

    public byte[] htmlToPdf(String html) {
        String text = html == null ? "" : html
                .replaceAll("<[^>]+>", " ")
                .replaceAll("\\s+", " ")
                .trim();
        List<String> lines = wrapText(text, MAX_CHARS);
        if (lines.isEmpty()) {
            lines = new ArrayList<>(List.of("(empty)"));
        }

        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            PDPageContentStream cs = new PDPageContentStream(doc, page);
            cs.beginText();
            cs.setFont(font, FONT_SIZE);
            float y = PDRectangle.A4.getHeight() - MARGIN;
            cs.newLineAtOffset(MARGIN, y);

            for (String raw : lines) {
                if (y < MIN_Y) {
                    cs.endText();
                    cs.close();
                    page = new PDPage(PDRectangle.A4);
                    doc.addPage(page);
                    cs = new PDPageContentStream(doc, page);
                    cs.beginText();
                    cs.setFont(font, FONT_SIZE);
                    y = PDRectangle.A4.getHeight() - MARGIN;
                    cs.newLineAtOffset(MARGIN, y);
                }
                cs.showText(pdfSafeLine(raw));
                cs.newLineAtOffset(0, -LEADING);
                y -= LEADING;
            }
            cs.endText();
            cs.close();
            doc.save(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    private List<String> wrapText(String text, int maxChars) {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return lines;
        }
        String[] words = text.split(" ");
        StringBuilder line = new StringBuilder();
        for (String word : words) {
            if (word.isEmpty()) {
                continue;
            }
            if (line.length() + word.length() + 1 > maxChars) {
                if (!line.isEmpty()) {
                    lines.add(line.toString());
                }
                line = new StringBuilder(word);
            } else {
                if (!line.isEmpty()) {
                    line.append(' ');
                }
                line.append(word);
            }
        }
        if (!line.isEmpty()) {
            lines.add(line.toString());
        }
        return lines;
    }

    private static String pdfSafeLine(String line) {
        if (line == null) {
            return " ";
        }
        StringBuilder sb = new StringBuilder();
        for (char c : line.toCharArray()) {
            if (c == '(' || c == ')' || c == '\\') {
                sb.append(' ');
            } else if (c >= 32 && c <= 126) {
                sb.append(c);
            } else if (Character.isWhitespace(c)) {
                sb.append(' ');
            } else {
                sb.append('?');
            }
        }
        String s = sb.toString().trim();
        return s.isEmpty() ? " " : s;
    }
}
