package in.gov.dgs.isep.meeting.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

/**
 * Extracts plain text from PDF and DOCX for version comparison.
 */
public final class DocumentTextExtractor {

    private DocumentTextExtractor() {}

    /**
     * Extract plain text from a file. Supports PDF and DOCX. Returns null for unsupported types or on error.
     */
    public static String extractText(Path path) throws IOException {
        if (path == null || !Files.isRegularFile(path)) return null;
        String name = path.getFileName().toString().toLowerCase(Locale.ROOT);
        if (name.endsWith(".pdf")) return extractFromPdf(path);
        if (name.endsWith(".docx")) return extractFromDocx(path);
        return null;
    }

    private static String extractFromPdf(Path path) throws IOException {
        try (PDDocument doc = Loader.loadPDF(path.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc);
            return text != null ? text.trim() : "";
        }
    }

    private static String extractFromDocx(Path path) throws IOException {
        try (InputStream in = Files.newInputStream(path);
             XWPFDocument doc = new XWPFDocument(in);
             XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            String text = extractor.getText();
            return text != null ? text.trim() : "";
        }
    }
}
