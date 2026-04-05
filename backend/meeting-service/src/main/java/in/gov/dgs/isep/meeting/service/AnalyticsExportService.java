package in.gov.dgs.isep.meeting.service;

import in.gov.dgs.isep.meeting.domain.Task;
import in.gov.dgs.isep.meeting.web.AnalyticsDto;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class AnalyticsExportService {

    public byte[] analyticsToExcel(AnalyticsDto a, List<Task> tasks) {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet summary = wb.createSheet("Summary");
            int r = 0;
            row(summary, r++, "Meeting", a.meetingTitle());
            row(summary, r++, "Meeting ID", a.meetingId() != null ? a.meetingId().toString() : "");
            row(summary, r++, "Total members", String.valueOf(a.totalMembers()));
            row(summary, r++, "Participated", String.valueOf(a.participated()));
            row(summary, r++, "Tasks total", String.valueOf(a.tasksTotal()));
            row(summary, r++, "Tasks completed", String.valueOf(a.tasksCompleted()));
            row(summary, r++, "Tasks overdue", String.valueOf(a.tasksOverdue()));
            row(summary, r++, "Task completion %", String.valueOf(a.taskCompletionRatePercent()));
            row(summary, r++, "Papers draft", String.valueOf(a.papersDraft()));
            row(summary, r++, "Papers approved", String.valueOf(a.papersApproved()));
            row(summary, r++, "Papers finalised", String.valueOf(a.papersFinalised()));
            row(summary, r++, "Avg approval days", a.avgApprovalDays() != null ? a.avgApprovalDays().toString() : "");

            Sheet taskSheet = wb.createSheet("Tasks");
            Row header = taskSheet.createRow(0);
            header.createCell(0).setCellValue("Title");
            header.createCell(1).setCellValue("Assignee");
            header.createCell(2).setCellValue("Status");
            header.createCell(3).setCellValue("Due date");
            header.createCell(4).setCellValue("Priority");
            int tr = 1;
            for (Task t : tasks) {
                Row row = taskSheet.createRow(tr++);
                row.createCell(0).setCellValue(n(t.getTitle()));
                row.createCell(1).setCellValue(t.getAssignedTo() != null ? n(t.getAssignedTo().getFullName()) : "");
                row.createCell(2).setCellValue(n(t.getStatus()));
                row.createCell(3).setCellValue(t.getDueDate() != null ? t.getDueDate().toString() : "");
                row.createCell(4).setCellValue(n(t.getPriority()));
            }
            for (int c = 0; c < 5; c++) {
                taskSheet.autoSizeColumn(c);
            }
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Excel export failed", e);
        }
    }

    private static void row(Sheet sheet, int idx, String k, String v) {
        Row row = sheet.createRow(idx);
        row.createCell(0).setCellValue(k);
        row.createCell(1).setCellValue(v != null ? v : "");
    }

    private static String n(String s) {
        return s != null ? s : "";
    }

    public byte[] analyticsToXml(AnalyticsDto a) {
        String xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                + "<analytics>\n"
                + "  <meetingId>" + esc(a.meetingId() != null ? a.meetingId().toString() : "") + "</meetingId>\n"
                + "  <meetingTitle>" + esc(a.meetingTitle()) + "</meetingTitle>\n"
                + "  <totalMembers>" + a.totalMembers() + "</totalMembers>\n"
                + "  <participated>" + a.participated() + "</participated>\n"
                + "  <tasksTotal>" + a.tasksTotal() + "</tasksTotal>\n"
                + "  <tasksCompleted>" + a.tasksCompleted() + "</tasksCompleted>\n"
                + "  <tasksOverdue>" + a.tasksOverdue() + "</tasksOverdue>\n"
                + "  <taskCompletionRatePercent>" + a.taskCompletionRatePercent() + "</taskCompletionRatePercent>\n"
                + "  <papersDraft>" + a.papersDraft() + "</papersDraft>\n"
                + "  <papersApproved>" + a.papersApproved() + "</papersApproved>\n"
                + "  <papersFinalised>" + a.papersFinalised() + "</papersFinalised>\n"
                + "  <avgApprovalDays>"
                + (a.avgApprovalDays() != null ? a.avgApprovalDays() : "")
                + "</avgApprovalDays>\n"
                + "</analytics>\n";
        return xml.getBytes(StandardCharsets.UTF_8);
    }

    private static String esc(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
