package com.appdev.set.controller.api;

import com.appdev.set.model.Booking;
import com.appdev.set.model.User;
import com.appdev.set.service.BookingService;
import com.appdev.set.service.ParkingCostService;
import com.appdev.set.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserPortalApiController {

    private final UserService userService;
    private final BookingService bookingService;
    private final ParkingCostService parkingCostService;

    public UserPortalApiController(
            UserService userService,
            BookingService bookingService,
            ParkingCostService parkingCostService
    ) {
        this.userService = userService;
        this.bookingService = bookingService;
        this.parkingCostService = parkingCostService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<UserDashboardResponse> dashboard(Authentication authentication) {
        User user = currentUser(authentication);
        List<Booking> bookings = bookingService.getUserBookings(user);

        long activeBookings = bookings.stream()
                .filter(booking -> {
                    Booking.BookingStatus status = booking.getStatus();
                    return status == Booking.BookingStatus.RESERVED || status == Booking.BookingStatus.ARRIVED;
                })
                .count();

        long completedBookings = bookings.stream()
                .filter(booking -> booking.getStatus() == Booking.BookingStatus.COMPLETED)
                .count();

        Optional<Booking> nextUpcomingBooking = bookings.stream()
                .filter(booking -> booking.getStatus() == Booking.BookingStatus.RESERVED)
                .sorted(Comparator
                        .comparing(Booking::getDate)
                        .thenComparing(Booking::getStartTime))
                .findFirst();

        UserDashboardResponse response = new UserDashboardResponse(
                user.getFullName(),
                user.getEmail(),
                user.getPlateNumber(),
                user.getVehicleType(),
                user.isCurrentlyBlocklisted(),
                user.getBlocklistMessage(),
                user.getBlocklistUntil() != null ? user.getBlocklistUntil().toString() : null,
                bookings.size(),
                activeBookings,
                completedBookings,
                parkingCostService.getCurrentRate().getHourlyRate(),
                nextUpcomingBooking
                        .map(booking -> new BookingSummaryDto(
                                booking.getId(),
                                booking.getDate().toString(),
                                booking.getStartTime() != null ? booking.getStartTime().toString() : null,
                                booking.getLevel(),
                                booking.getSlotName(),
                                booking.getStatus().name()
                        ))
                        .orElse(null)
        );

        return ResponseEntity.ok(response);
    }

    private User currentUser(Authentication authentication) {
        return userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public record UserDashboardResponse(
            String fullName,
            String email,
            String plateNumber,
            String vehicleType,
            boolean blocklisted,
            String blocklistMessage,
            String blocklistUntil,
            long totalBookings,
            long activeBookings,
            long completedBookings,
            double currentHourlyRate,
            BookingSummaryDto nextUpcomingBooking
    ) {
    }

    public record BookingSummaryDto(
            Long id,
            String date,
            String startTime,
            String level,
            String slotName,
            String status
    ) {
    }
}
