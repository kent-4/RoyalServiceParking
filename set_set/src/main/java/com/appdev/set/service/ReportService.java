package com.appdev.set.service;

import com.appdev.set.model.Booking;
import com.appdev.set.model.BookingSummary;
import com.appdev.set.repository.BookingRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.Font;
import com.itextpdf.text.pdf.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ReportService {

    @Autowired
    private BookingRepository bookingRepository;

    public BookingRepository getBookingRepository() {
        return bookingRepository;
    }

    public List<BookingSummary> getBookingSummary(LocalDate startDate, LocalDate endDate, String period) {
        List<Booking> bookings = bookingRepository.findByDateBetween(startDate, endDate);
        
        // Group bookings by date
        Map<LocalDate, List<Booking>> bookingsByDate = bookings.stream()
                .collect(Collectors.groupingBy(Booking::getDate));
        
        List<BookingSummary> summaries = new ArrayList<>();
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<Booking> dayBookings = bookingsByDate.getOrDefault(date, new ArrayList<>());
            
            // Count all bookings for the day
            long totalBookings = dayBookings.size();
            
            // Only count completed bookings for earnings and completion metrics
            long completedBookings = dayBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                .count();
                
            double totalEarnings = dayBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                .mapToDouble(Booking::getParkingCost)
                .sum();
                
            long canceledBookings = dayBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CANCELED)
                .count();
                
            long noShowBookings = dayBookings.stream()
                .filter(b -> b.isAutoExpired())
                .count();
            
            summaries.add(new BookingSummary(date, completedBookings, totalEarnings, 
                    completedBookings, canceledBookings, noShowBookings));
        }
        
        // Aggregate data based on period if needed
        if ("week".equals(period)) {
            return aggregateByWeek(summaries);
        } else if ("month".equals(period)) {
            return aggregateByMonth(summaries);
        }
        
        return summaries;
    }

    public Map<String, Object> getReportStatistics(LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings = bookingRepository.findByDateBetween(startDate, endDate);
        
        long totalBookings = bookings.size();
        long completedBookings = bookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
            .count();
        long canceledBookings = bookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.CANCELED)
            .count();
        long noShowBookings = bookings.stream()
            .filter(b -> b.isAutoExpired())
            .count();
            
        double totalEarnings = bookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
            .mapToDouble(Booking::getParkingCost)
            .sum();
            
        double completionRate = totalBookings > 0 ? (double) completedBookings / totalBookings * 100 : 0;
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", totalBookings);
        stats.put("completedBookings", completedBookings);
        stats.put("canceledBookings", canceledBookings);
        stats.put("noShowBookings", noShowBookings);
        stats.put("totalEarnings", totalEarnings);
        stats.put("completionRate", Math.round(completionRate * 100.0) / 100.0);
        
        return stats;
    }

    public Map<String, Long> getVehicleTypeStatistics(LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings = bookingRepository.findByDateBetween(startDate, endDate);
        
        return bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                .collect(Collectors.groupingBy(
                    booking -> booking.getVehicleType() != null ? booking.getVehicleType() : "Unknown",
                    Collectors.counting()
                ));
    }

    public Map<String, Long> getBookingStatusStatistics(LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings = bookingRepository.findByDateBetween(startDate, endDate);
        
        Map<String, Long> statusStats = new HashMap<>();
        statusStats.put("COMPLETED", bookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
            .count());
        statusStats.put("CANCELED", bookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.CANCELED)
            .count());
        statusStats.put("RESERVED", bookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.RESERVED)
            .count());
        statusStats.put("ARRIVED", bookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.ARRIVED)
            .count());
        statusStats.put("NO_SHOW", bookings.stream()
            .filter(b -> b.isAutoExpired())
            .count());
            
        return statusStats;
    }

    private List<BookingSummary> aggregateByWeek(List<BookingSummary> dailySummaries) {
        Map<LocalDate, List<BookingSummary>> weeklyMap = dailySummaries.stream()
                .collect(Collectors.groupingBy(s -> s.getDate().minusDays(s.getDate().getDayOfWeek().getValue() - 1)));
        
        return weeklyMap.entrySet().stream()
                .map(entry -> aggregateSummaries(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(BookingSummary::getDate))
                .collect(Collectors.toList());
    }

    private List<BookingSummary> aggregateByMonth(List<BookingSummary> dailySummaries) {
        Map<LocalDate, List<BookingSummary>> monthlyMap = dailySummaries.stream()
                .collect(Collectors.groupingBy(s -> s.getDate().withDayOfMonth(1)));
        
        return monthlyMap.entrySet().stream()
                .map(entry -> aggregateSummaries(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(BookingSummary::getDate))
                .collect(Collectors.toList());
    }

    private BookingSummary aggregateSummaries(LocalDate date, List<BookingSummary> summaries) {
        long totalBookings = summaries.stream().mapToLong(BookingSummary::getTotalBookings).sum();
        double totalEarnings = summaries.stream().mapToDouble(BookingSummary::getTotalEarnings).sum();
        long completedBookings = summaries.stream().mapToLong(BookingSummary::getCompletedBookings).sum();
        long canceledBookings = summaries.stream().mapToLong(BookingSummary::getCanceledBookings).sum();
        long noShowBookings = summaries.stream().mapToLong(BookingSummary::getNoShowBookings).sum();
        
        return new BookingSummary(date, totalBookings, totalEarnings, 
                completedBookings, canceledBookings, noShowBookings);
    }

    public byte[] generateExcelReport(List<BookingSummary> summaries, Map<LocalDate, List<String>> vehicleTypesByDate) throws Exception {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Booking Summary");

            // Create header row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Date");
            headerRow.createCell(1).setCellValue("Total Completed Bookings");
            headerRow.createCell(2).setCellValue("Total Earnings (Completed)");
            headerRow.createCell(3).setCellValue("Vehicle Type(s)");
            headerRow.createCell(4).setCellValue("Canceled Bookings");
            headerRow.createCell(5).setCellValue("No Show Bookings");

            // Create data rows
            int rowNum = 1;
            for (BookingSummary summary : summaries) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(summary.getDate().toString());
                row.createCell(1).setCellValue(summary.getCompletedBookings());
                row.createCell(2).setCellValue(summary.getTotalEarnings());
                // Vehicle types for this date
                List<String> types = vehicleTypesByDate.getOrDefault(summary.getDate(), List.of());
                row.createCell(3).setCellValue(String.join(", ", types));
                row.createCell(4).setCellValue(summary.getCanceledBookings());
                row.createCell(5).setCellValue(summary.getNoShowBookings());
            }

            // Auto-size columns
            for (int i = 0; i < 6; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    public byte[] generatePdfReport(List<BookingSummary> summaries, Map<LocalDate, List<String>> vehicleTypesByDate) throws Exception {
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Add title
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
        Paragraph title = new Paragraph("Royal Service Parking - Booking Summary Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph("\n"));

        // Create table with 6 columns
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2, 2, 2, 3, 2, 2});

        // Add header row
        Stream.of("Date", "Completed Bookings", "Total Earnings", "Vehicle Types", "Canceled", "No Show")
            .forEach(columnTitle -> {
                PdfPCell header = new PdfPCell();
                header.setBackgroundColor(BaseColor.LIGHT_GRAY);
                header.setBorderWidth(2);
                header.setPhrase(new Phrase(columnTitle));
                table.addCell(header);
            });

        // Add data rows
        for (BookingSummary summary : summaries) {
            table.addCell(summary.getDate().toString());
            table.addCell(String.valueOf(summary.getCompletedBookings()));
            table.addCell(String.format("₱%.2f", summary.getTotalEarnings()));
            List<String> types = vehicleTypesByDate.getOrDefault(summary.getDate(), List.of());
            table.addCell(String.join(", ", types));
            table.addCell(String.valueOf(summary.getCanceledBookings()));
            table.addCell(String.valueOf(summary.getNoShowBookings()));
        }

        document.add(table);
        document.close();

        return outputStream.toByteArray();
    }

    public byte[] exportExcelReport(LocalDate startDate, LocalDate endDate, String period) throws Exception {
        List<BookingSummary> summaries = getBookingSummary(startDate, endDate, period);
        Map<LocalDate, List<String>> vehicleTypesByDate = getCompletedVehicleTypesByDate(startDate, endDate, summaries);
        return generateExcelReport(summaries, vehicleTypesByDate);
    }

    public byte[] exportPdfReport(LocalDate startDate, LocalDate endDate, String period) throws Exception {
        List<BookingSummary> summaries = getBookingSummary(startDate, endDate, period);
        Map<LocalDate, List<String>> vehicleTypesByDate = getCompletedVehicleTypesByDate(startDate, endDate, summaries);
        return generatePdfReport(summaries, vehicleTypesByDate);
    }

    public Map<LocalDate, List<String>> getCompletedVehicleTypesByDate(
            LocalDate startDate,
            LocalDate endDate,
            List<BookingSummary> summaries
    ) {
        Map<LocalDate, List<String>> vehicleTypesByDate = new HashMap<>();
        List<Booking> bookings = bookingRepository.findByDateBetween(startDate, endDate);
        Map<LocalDate, List<Booking>> bookingsByDate = bookings.stream()
                .collect(Collectors.groupingBy(Booking::getDate));

        for (BookingSummary summary : summaries) {
            List<String> types = bookingsByDate.getOrDefault(summary.getDate(), Collections.emptyList()).stream()
                    .filter(booking -> booking.getStatus() == Booking.BookingStatus.COMPLETED)
                    .map(booking -> booking.getVehicleType() != null ? booking.getVehicleType() : "Unknown")
                    .distinct()
                    .collect(Collectors.toList());
            vehicleTypesByDate.put(summary.getDate(), types);
        }

        return vehicleTypesByDate;
    }
}
