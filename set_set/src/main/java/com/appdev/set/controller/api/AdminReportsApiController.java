package com.appdev.set.controller.api;

import com.appdev.set.model.BookingSummary;
import com.appdev.set.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
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
        LocalDate resolvedEndDate = endDate != null ? endDate : LocalDate.now();
        LocalDate resolvedStartDate = startDate != null ? startDate : resolvedEndDate.withDayOfMonth(1);
        String resolvedPeriod = normalizePeriod(period);

        List<BookingSummary> summary = reportService.getBookingSummary(resolvedStartDate, resolvedEndDate, resolvedPeriod);
        Map<String, Object> statistics = reportService.getReportStatistics(resolvedStartDate, resolvedEndDate);
        Map<String, Long> vehicleTypeStatistics = reportService.getVehicleTypeStatistics(resolvedStartDate, resolvedEndDate);
        Map<String, Long> bookingStatusStatistics = reportService.getBookingStatusStatistics(resolvedStartDate, resolvedEndDate);

        return ResponseEntity.ok(new AdminReportsDashboardResponse(
                resolvedStartDate.toString(),
                resolvedEndDate.toString(),
                resolvedPeriod,
                periodLabel(resolvedPeriod),
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
}
