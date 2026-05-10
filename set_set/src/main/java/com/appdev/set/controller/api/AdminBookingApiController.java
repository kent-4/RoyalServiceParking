package com.appdev.set.controller.api;

import com.appdev.set.model.Booking;
import com.appdev.set.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/admin/bookings")
public class AdminBookingApiController {

    private final BookingService bookingService;

    public AdminBookingApiController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<AdminBookingsResponse> bookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String slot
    ) {
        Booking.BookingStatus filterStatus = parseStatus(status);
        LocalDate filterDate = parseDate(date);
        String userQuery = normalize(user);
        String slotQuery = normalize(slot);

        List<Booking> bookings = bookingService.getAllBookings().stream()
                .filter(booking -> filterStatus == null || booking.getStatus() == filterStatus)
                .filter(booking -> filterDate == null || filterDate.equals(booking.getDate()))
                .filter(booking -> userQuery.isEmpty() || matchesUser(booking, userQuery))
                .filter(booking -> slotQuery.isEmpty() || matchesSlot(booking, slotQuery))
                .sorted(bookingComparator())
                .toList();

        long reservedCount = bookings.stream().filter(booking -> booking.getStatus() == Booking.BookingStatus.RESERVED).count();
        long arrivedCount = bookings.stream().filter(booking -> booking.getStatus() == Booking.BookingStatus.ARRIVED).count();
        long completedCount = bookings.stream().filter(booking -> booking.getStatus() == Booking.BookingStatus.COMPLETED).count();
        long canceledCount = bookings.stream().filter(booking -> booking.getStatus() == Booking.BookingStatus.CANCELED).count();

        List<AdminBookingListItemDto> items = bookings.stream()
                .map(this::toListItem)
                .toList();

        return ResponseEntity.ok(new AdminBookingsResponse(
                items,
                items.size(),
                reservedCount,
                arrivedCount,
                completedCount,
                canceledCount
        ));
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

    private boolean matchesUser(Booking booking, String query) {
        return normalize(booking.getUser() != null ? booking.getUser().getFullName() : "").contains(query)
                || normalize(booking.getUser() != null ? booking.getUser().getEmail() : "").contains(query);
    }

    private boolean matchesSlot(Booking booking, String query) {
        return normalize(booking.getLevel()).contains(query)
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

    private AdminBookingListItemDto toListItem(Booking booking) {
        return new AdminBookingListItemDto(
                booking.getId(),
                booking.getUser() != null ? booking.getUser().getId() : null,
                booking.getUser() != null ? safe(booking.getUser().getFullName()) : "Unknown user",
                booking.getUser() != null ? safe(booking.getUser().getEmail()) : "Not provided",
                safe(booking.getPlateNumber()),
                safe(booking.getVehicleType()),
                booking.getDate() != null ? booking.getDate().toString() : null,
                booking.getStartTime() != null ? booking.getStartTime().toString() : null,
                booking.getExitTime() != null ? booking.getExitTime().toString() : null,
                booking.getArrivalTime() != null ? booking.getArrivalTime().toString() : null,
                safe(booking.getLevel()),
                safe(booking.getSlotName()),
                booking.getParkingCost(),
                booking.getStatus().name()
        );
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "Not provided" : value;
    }

    public record AdminBookingsResponse(
            List<AdminBookingListItemDto> bookings,
            int totalResults,
            long reservedCount,
            long arrivedCount,
            long completedCount,
            long canceledCount
    ) {
    }

    public record AdminBookingListItemDto(
            Long id,
            Long userId,
            String fullName,
            String email,
            String plateNumber,
            String vehicleType,
            String date,
            String startTime,
            String exitTime,
            String arrivalTime,
            String level,
            String slotName,
            double parkingCost,
            String status
    ) {
    }
}
