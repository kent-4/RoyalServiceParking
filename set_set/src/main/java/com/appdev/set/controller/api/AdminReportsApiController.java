package com.appdev.set.controller.api;

import com.appdev.set.model.BookingSummary;
import com.appdev.set.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportsApiController {

    private final ReportService reportService;

    public AdminReportsApiController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminReportsDashboardResponse> dashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "day") String period
    ) {
        ReportFilter filter = resolveFilter(startDate, endDate, period);

        List<BookingSummary> summary = reportService.getBookingSummary(filter.startDate(), filter.endDate(), filter.period());
        Map<String, Object> statistics = reportService.getReportStatistics(filter.startDate(), filter.endDate());
        Map<String, Long> vehicleTypeStatistics = reportService.getVehicleTypeStatistics(filter.startDate(), filter.endDate());
        Map<String, Long> bookingStatusStatistics = reportService.getBookingStatusStatistics(filter.startDate(), filter.endDate());

        return ResponseEntity.ok(new AdminReportsDashboardResponse(
                filter.startDate().toString(),
                filter.endDate().toString(),
                filter.period(),
                periodLabel(filter.period()),
                summary.stream().map(this::toSummary).toList(),
                new ReportStatisticsDto(
                        longValue(statistics.get("totalBookings")),
                        longValue(statistics.get("completedBookings")),
                        longValue(statistics.get("canceledBookings")),
                        longValue(statistics.get("noShowBookings")),
                        doubleValue(statistics.get("totalEarnings")),
                        doubleValue(statistics.get("completionRate"))
                ),
                vehicleTypeStatistics.entrySet().stream()
                        .map(entry -> new DistributionItemDto(entry.getKey(), entry.getValue()))
                        .toList(),
                bookingStatusStatistics.entrySet().stream()
                        .map(entry -> new DistributionItemDto(entry.getKey(), entry.getValue()))
                        .toList()
        ));
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "day") String period
    ) throws Exception {
        ReportFilter filter = resolveFilter(startDate, endDate, period);
        byte[] report = reportService.exportExcelReport(filter.startDate(), filter.endDate(), filter.period());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, buildAttachmentHeader("xlsx", filter))
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ))
                .body(report);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "day") String period
    ) throws Exception {
        ReportFilter filter = resolveFilter(startDate, endDate, period);
        byte[] report = reportService.exportPdfReport(filter.startDate(), filter.endDate(), filter.period());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, buildAttachmentHeader("pdf", filter))
                .contentType(MediaType.APPLICATION_PDF)
                .body(report);
    }

    private ReportFilter resolveFilter(LocalDate startDate, LocalDate endDate, String period) {
        LocalDate resolvedEndDate = endDate != null ? endDate : LocalDate.now();
        LocalDate resolvedStartDate = startDate != null ? startDate : resolvedEndDate.withDayOfMonth(1);
        return new ReportFilter(resolvedStartDate, resolvedEndDate, normalizePeriod(period));
    }

    private String normalizePeriod(String period) {
        return switch (period == null ? "" : period.trim().toLowerCase()) {
            case "week" -> "week";
            case "month" -> "month";
            default -> "day";
        };
    }

    private String periodLabel(String period) {
        return switch (period) {
            case "week" -> "Weekly";
            case "month" -> "Monthly";
            default -> "Daily";
        };
    }

    private BookingSummaryDto toSummary(BookingSummary summary) {
        return new BookingSummaryDto(
                summary.getDate().toString(),
                summary.getTotalBookings(),
                summary.getCompletedBookings(),
                summary.getCanceledBookings(),
                summary.getNoShowBookings(),
                summary.getTotalEarnings()
        );
    }

    private long longValue(Object value) {
        return value instanceof Number number ? number.longValue() : 0L;
    }

    private double doubleValue(Object value) {
        return value instanceof Number number ? number.doubleValue() : 0.0;
    }

    private String buildAttachmentHeader(String extension, ReportFilter filter) {
        String fileName = "royal-service-parking-report_%s_to_%s_%s.%s".formatted(
                filter.startDate(),
                filter.endDate(),
                filter.period(),
                extension
        );
        return "attachment; filename=\"" + fileName + "\"";
    }

    public record AdminReportsDashboardResponse(
            String startDate,
            String endDate,
            String period,
            String periodLabel,
            List<BookingSummaryDto> summary,
            ReportStatisticsDto statistics,
            List<DistributionItemDto> vehicleTypes,
            List<DistributionItemDto> bookingStatuses
    ) {
    }

    public record BookingSummaryDto(
            String date,
            long totalBookings,
            long completedBookings,
            long canceledBookings,
            long noShowBookings,
            double totalEarnings
    ) {
    }

    public record ReportStatisticsDto(
            long totalBookings,
            long completedBookings,
            long canceledBookings,
            long noShowBookings,
            double totalEarnings,
            double completionRate
    ) {
    }

    public record DistributionItemDto(String label, long count) {
    }

    private record ReportFilter(LocalDate startDate, LocalDate endDate, String period) {
    }
}
