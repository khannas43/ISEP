package in.gov.dgs.isep.meeting.web;

import java.util.List;

public class FeedbackArchivePageDto {

    private List<FeedbackArchiveRowDto> data;
    private PaginationDto pagination;

    public static class PaginationDto {
        private int page;
        private int size;
        private long totalElements;

        public int getPage() { return page; }
        public void setPage(int page) { this.page = page; }
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
        public long getTotalElements() { return totalElements; }
        public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
    }

    public List<FeedbackArchiveRowDto> getData() { return data; }
    public void setData(List<FeedbackArchiveRowDto> data) { this.data = data; }
    public PaginationDto getPagination() { return pagination; }
    public void setPagination(PaginationDto pagination) { this.pagination = pagination; }
}
