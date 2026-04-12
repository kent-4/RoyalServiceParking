package com.appdev.set.controller;

import com.appdev.set.model.BookingSummary;
import com.appdev.set.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping
    public String showReportsPage(Model model) {
        try {
            // Set default date range to current month
            LocalDate now = LocalDate.now();
            LocalDate startDate = now.withDayOfMonth(1);
            LocalDate endDate = now.withDayOfMonth(now.lengthOfMonth());
            
            System.out.println("DEBUG: Loading reports page with dates: " + startDate + " to " + endDate);
            
            List<BookingSummary> summaries = reportService.getBookingSummary(startDate, endDate, "day");
            Map<String, Object> statistics = reportService.getReportStatistics(startDate, endDate);
            
            model.addAttribute("startDate", startDate);
            model.addAttribute("endDate", endDate);
            model.addAttribute("summaries", summaries);
            model.addAttribute("statistics", statistics);
            
            System.out.println("DEBUG: Reports page loaded successfully");
            return "admin/reports/dashboard";
        } catch (Exception e) {
            System.err.println("ERROR: Failed to load reports page: " + e.getMessage());
            e.printStackTrace();
            model.addAttribute("error", "Failed to load reports: " + e.getMessage());
            return "admin/reports/dashboard";
        }
    }

    @GetMapping("/data")
    @ResponseBody
    public ResponseEntity<?> getReportData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "day") String period) {
        try {
            System.out.println("DEBUG: Getting report data for dates: " + startDate + " to " + endDate + ", period: " + period);
            
            List<BookingSummary> summaries = reportService.getBookingSummary(startDate, endDate, period);
            
            System.out.println("DEBUG: Found " + summaries.size() + " booking summaries");
            
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get report data: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load report data: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/statistics")
    @ResponseBody
    public ResponseEntity<?> getReportStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            System.out.println("DEBUG: Getting statistics for dates: " + startDate + " to " + endDate);
            
            Map<String, Object> statistics = reportService.getReportStatistics(startDate, endDate);
            
            System.out.println("DEBUG: Statistics: " + statistics);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get statistics: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/vehicle-types")
    @ResponseBody
    public ResponseEntity<?> getVehicleTypeStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            System.out.println("DEBUG: Getting vehicle type statistics for dates: " + startDate + " to " + endDate);
            
            Map<String, Long> vehicleStats = reportService.getVehicleTypeStatistics(startDate, endDate);
            
            System.out.println("DEBUG: Vehicle type statistics: " + vehicleStats);
            
            return ResponseEntity.ok(vehicleStats);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get vehicle type statistics: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load vehicle type statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/booking-status")
    @ResponseBody
    public ResponseEntity<?> getBookingStatusStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            System.out.println("DEBUG: Getting booking status statistics for dates: " + startDate + " to " + endDate);
            
            Map<String, Long> statusStats = reportService.getBookingStatusStatistics(startDate, endDate);
            
            System.out.println("DEBUG: Booking status statistics: " + statusStats);
            
            return ResponseEntity.ok(statusStats);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get booking status statistics: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to load booking status statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "day") String period) throws Exception {
        
        List<BookingSummary> summaries = reportService.getBookingSummary(startDate, endDate, period);
        
        // Build vehicle types by date
        Map<LocalDate, List<String>> vehicleTypesByDate = new java.util.HashMap<>();
        List<com.appdev.set.model.Booking> bookings = reportService.getBookingRepository().findByDateBetween(startDate, endDate);
        Map<LocalDate, List<com.appdev.set.model.Booking>> bookingsByDate = bookings.stream()
            .collect(Collectors.groupingBy(com.appdev.set.model.Booking::getDate));
            
        for (BookingSummary summary : summaries) {
            List<String> types = bookingsByDate.getOrDefault(summary.getDate(), Collections.emptyList()).stream()
                .filter(b -> b.getStatus() == com.appdev.set.model.Booking.BookingStatus.COMPLETED)
                .map(b -> b.getVehicleType() != null ? b.getVehicleType() : "Unknown")
                .distinct()
                .collect(Collectors.toList());
            vehicleTypesByDate.put(summary.getDate(), types);
        }
        
        byte[] excelFile = reportService.generateExcelReport(summaries, vehicleTypesByDate);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=parking_report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelFile);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "day") String period) throws Exception {
        
        List<BookingSummary> summaries = reportService.getBookingSummary(startDate, endDate, period);
        
        // Build vehicle types by date
        Map<LocalDate, List<String>> vehicleTypesByDate = new java.util.HashMap<>();
        List<com.appdev.set.model.Booking> bookings = reportService.getBookingRepository().findByDateBetween(startDate, endDate);
        Map<LocalDate, List<com.appdev.set.model.Booking>> bookingsByDate = bookings.stream()
            .collect(Collectors.groupingBy(com.appdev.set.model.Booking::getDate));
            
        for (BookingSummary summary : summaries) {
            List<String> types = bookingsByDate.getOrDefault(summary.getDate(), Collections.emptyList()).stream()
                .filter(b -> b.getStatus() == com.appdev.set.model.Booking.BookingStatus.COMPLETED)
                .map(b -> b.getVehicleType() != null ? b.getVehicleType() : "Unknown")
                .distinct()
                .collect(Collectors.toList());
            vehicleTypesByDate.put(summary.getDate(), types);
        }
        
        byte[] pdfFile = reportService.generatePdfReport(summaries, vehicleTypesByDate);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=parking_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfFile);
    }
}
