package com.appdev.set.controller.api;

import com.appdev.set.controller.api.response.ApiErrorResponse;
import com.appdev.set.model.Booking;
import com.appdev.set.service.BookingService;
import com.appdev.set.service.ParkingCostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
@RestController
@RequestMapping("/api/cashier/bookings")
public class CashierBookingApiController {

    private final BookingService bookingService;
    private final ParkingCostService parkingCostService;

    public CashierBookingApiController(BookingService bookingService, ParkingCostService parkingCostService) {
        this.bookingService = bookingService;
        this.parkingCostService = parkingCostService;
    }

    @GetMapping
    public ResponseEntity<CashierBookingsResponse> bookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String slot,
            @RequestParam(required = false) String search
    ) {
        Booking.BookingStatus filterStatus = parseStatus(status);
        LocalDate filterDate = parseDate(date);
        String slotQuery = normalize(slot);
        String searchQuery = normalize(search);

        List<Booking> bookings = bookingService.getAllBookings().stream()
                .filter(booking -> filterStatus == null || booking.getStatus() == filterStatus)
                .filter(booking -> filterDate == null || filterDate.equals(booking.getDate()))
                .filter(booking -> slotQuery.isEmpty() || matchesSlot(booking, slotQuery))
                .filter(booking -> searchQuery.isEmpty() || matchesSearch(booking, searchQuery))
                .sorted(bookingComparator())
                .toList();

        long reservedCount = bookings.stream().filter(booking -> booking.getStatus() == Booking.BookingStatus.RESERVED).count();
        long arrivedCount = bookings.stream().filter(booking -> booking.getStatus() == Booking.BookingStatus.ARRIVED).count();
        long completedCount = bookings.stream().filter(booking -> booking.getStatus() == Booking.BookingStatus.COMPLETED).count();
        long canceledCount = bookings.stream().filter(booking -> booking.getStatus() == Booking.BookingStatus.CANCELED).count();

        List<CashierBookingListItemDto> items = bookings.stream()
                .map(this::toListItem)
                .toList();

        return ResponseEntity.ok(new CashierBookingsResponse(
                items,
                items.size(),
                reservedCount,
                arrivedCount,
                completedCount,
                canceledCount
        ));
    }

    @PostMapping("/{id}/arrive")
    public ResponseEntity<?> markArrived(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .<ResponseEntity<?>>map(booking -> {
                    if (booking.getStatus() != Booking.BookingStatus.RESERVED) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(ApiErrorResponse.of("Only reserved bookings can be marked as arrived."));
                    }

                    Booking updated = bookingService.markUserArrived(id);
                    return ResponseEntity.ok(new BookingMutationResponse(
                            "User marked as arrived.",
                            toListItem(updated)
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiErrorResponse.of("Booking not found.")));
    }

    @GetMapping("/{id}/payment")
    public ResponseEntity<?> paymentPreview(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .<ResponseEntity<?>>map(booking -> ResponseEntity.ok(toPaymentPreview(booking)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiErrorResponse.of("Booking not found.")));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .<ResponseEntity<?>>map(booking -> {
                    if (booking.getStatus() != Booking.BookingStatus.ARRIVED) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(ApiErrorResponse.of("Only arrived bookings can be completed."));
                    }

                    Booking completed = bookingService.updateBookingStatus(id, Booking.BookingStatus.COMPLETED);
                    return ResponseEntity.ok(new BookingCompletionResponse(
                            "Payment completed successfully.",
                            completed.getId(),
                            toListItem(completed)
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiErrorResponse.of("Booking not found.")));
    }

    @GetMapping("/{id}/receipt")
    public ResponseEntity<?> receipt(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .<ResponseEntity<?>>map(booking -> {
                    if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(ApiErrorResponse.of("A receipt is available only after payment is completed."));
                    }

                    return ResponseEntity.ok(toReceipt(booking));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiErrorResponse.of("Booking not found.")));
    }

    private Comparator<Booking> bookingComparator() {
        return Comparator
                .comparingInt((Booking booking) -> statusOrder(booking.getStatus()))
                .thenComparing(Booking::getDate, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(Booking::getStartTime, Comparator.nullsLast(Comparator.reverseOrder()));
    }

    private int statusOrder(Booking.BookingStatus status) {
        return switch (status) {
            case RESERVED -> 1;
            case ARRIVED -> 2;
            case COMPLETED -> 3;
            case CANCELED -> 4;
            default -> 5;
        };
    }

    private boolean matchesSlot(Booking booking, String query) {
        return normalize(booking.getLevel()).contains(query)
                || normalize(booking.getSlotName()).contains(query);
    }

    private boolean matchesSearch(Booking booking, String query) {
        return String.valueOf(booking.getId()).contains(query)
                || normalize(booking.getUser() != null ? booking.getUser().getFullName() : "").contains(query)
                || normalize(booking.getPlateNumber()).contains(query)
                || normalize(booking.getVehicleType()).contains(query)
                || normalize(booking.getLevel()).contains(query)
                || normalize(booking.getSlotName()).contains(query);
    }

    private Booking.BookingStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        try {
            return Booking.BookingStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(value.trim());
        } catch (Exception exception) {
            return null;
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private CashierBookingPaymentResponse toPaymentPreview(Booking booking) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDateTime = LocalDateTime.of(booking.getDate(), booking.getStartTime());
        LocalDateTime exitDateTime = LocalDateTime.of(now.toLocalDate(), now.toLocalTime());

        if (exitDateTime.isBefore(startDateTime)) {
            exitDateTime = exitDateTime.plusDays(1);
        }

        long minutesBetween = Duration.between(startDateTime, exitDateTime).toMinutes();
        if (minutesBetween < 0) {
            minutesBetween = 0;
        }

        long totalHours = Math.max(1, (minutesBetween + 59) / 60);
        long parkingDays = totalHours / 24;
        long parkingHours = totalHours % 24;
        double hourlyRate = parkingCostService.getCurrentRate().getHourlyRate();
        double previewCost = totalHours * hourlyRate;

        return new CashierBookingPaymentResponse(
                booking.getId(),
                booking.getUser() != null ? booking.getUser().getId() : null,
                booking.getUser() != null ? safe(booking.getUser().getFullName()) : "Unknown user",
                booking.getUser() != null ? safe(booking.getUser().getEmail()) : "Not provided",
                safe(booking.getPlateNumber()),
                safe(booking.getVehicleType()),
                booking.getDate() != null ? booking.getDate().toString() : null,
                booking.getStartTime() != null ? booking.getStartTime().toString() : null,
                now.toLocalTime().toString(),
                safe(booking.getLevel()),
                safe(booking.getSlotName()),
                booking.getStatus().name(),
                totalHours,
                parkingDays,
                parkingHours,
                hourlyRate,
                previewCost,
                booking.getStatus() == Booking.BookingStatus.ARRIVED
        );
    }

    private CashierBookingReceiptResponse toReceipt(Booking booking) {
        long totalHours = Math.max(1, booking.getParkingHours());
        long parkingDays = totalHours / 24;
        long parkingHours = totalHours % 24;
        double hourlyRate = parkingCostService.getCurrentRate().getHourlyRate();

        return new CashierBookingReceiptResponse(
                booking.getId(),
                booking.getUser() != null ? safe(booking.getUser().getFullName()) : "Unknown user",
                safe(booking.getPlateNumber()),
                safe(booking.getVehicleType()),
                booking.getDate() != null ? booking.getDate().toString() : null,
                booking.getStartTime() != null ? booking.getStartTime().toString() : null,
                booking.getExitTime() != null ? booking.getExitTime().toString() : null,
                safe(booking.getLevel()),
                safe(booking.getSlotName()),
                totalHours,
                parkingDays,
                parkingHours,
                hourlyRate,
                booking.getParkingCost(),
                booking.getStatus().name()
        );
    }

    private CashierBookingListItemDto toListItem(Booking booking) {
        Booking.BookingStatus status = booking.getStatus();

        return new CashierBookingListItemDto(
                booking.getId(),
                booking.getUser() != null ? booking.getUser().getId() : null,
                booking.getUser() != null ? safe(booking.getUser().getFullName()) : "Unknown user",
                safe(booking.getPlateNumber()),
                safe(booking.getVehicleType()),
                booking.getDate() != null ? booking.getDate().toString() : null,
                booking.getStartTime() != null ? booking.getStartTime().toString() : null,
                booking.getExitTime() != null ? booking.getExitTime().toString() : null,
                booking.getArrivalTime() != null ? booking.getArrivalTime().toString() : null,
                safe(booking.getLevel()),
                safe(booking.getSlotName()),
                booking.getParkingCost(),
                status.name(),
                status == Booking.BookingStatus.RESERVED,
                status == Booking.BookingStatus.ARRIVED,
                status == Booking.BookingStatus.COMPLETED
        );
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "Not provided" : value;
    }

    public record CashierBookingsResponse(
            List<CashierBookingListItemDto> bookings,
            int totalResults,
            long reservedCount,
            long arrivedCount,
            long completedCount,
            long canceledCount
    ) {
    }

    public record CashierBookingListItemDto(
            Long id,
            Long userId,
            String fullName,
            String plateNumber,
            String vehicleType,
            String date,
            String startTime,
            String exitTime,
            String arrivalTime,
            String level,
            String slotName,
            double parkingCost,
            String status,
            boolean canMarkArrived,
            boolean canOpenPayment,
            boolean canViewReceipt
    ) {
    }

    public record BookingMutationResponse(String message, CashierBookingListItemDto booking) {
    }

    public record CashierBookingPaymentResponse(
            Long bookingId,
            Long userId,
            String fullName,
            String email,
            String plateNumber,
            String vehicleType,
            String date,
            String startTime,
            String previewExitTime,
            String level,
            String slotName,
            String status,
            long totalHours,
            long parkingDays,
            long parkingHours,
            double hourlyRate,
            double previewCost,
            boolean canComplete
    ) {
    }

    public record BookingCompletionResponse(String message, Long bookingId, CashierBookingListItemDto booking) {
    }

    public record CashierBookingReceiptResponse(
            Long bookingId,
            String fullName,
            String plateNumber,
            String vehicleType,
            String date,
            String startTime,
            String exitTime,
            String level,
            String slotName,
            long totalHours,
            long parkingDays,
            long parkingHours,
            double hourlyRate,
            double totalCost,
            String status
    ) {
    }
}
