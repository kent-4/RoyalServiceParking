package com.appdev.set.controller.api;

import com.appdev.set.controller.api.response.ApiErrorResponse;
import com.appdev.set.model.Booking;
import com.appdev.set.model.User;
import com.appdev.set.service.BookingService;
import com.appdev.set.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Locale;
@RestController
@RequestMapping("/api/cashier/users")
public class CashierUserApiController {

    private final UserService userService;
    private final BookingService bookingService;

    public CashierUserApiController(UserService userService, BookingService bookingService) {
        this.userService = userService;
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<CashierUsersResponse> users(@RequestParam(required = false) String search) {
        String query = search != null ? search.trim().toLowerCase(Locale.ROOT) : "";

        List<User> verifiedCustomers = userService.getAllUsers().stream()
                .filter(user -> "USER".equals(user.getRole()) && user.isVerified())
                .toList();

        List<UserSummaryDto> users = verifiedCustomers.stream()
                .filter(user -> query.isEmpty() || matchesSearch(user, query))
                .map(this::toSummary)
                .toList();

        long restrictedCount = verifiedCustomers.stream()
                .filter(User::isCurrentlyBlocklisted)
                .count();

        return ResponseEntity.ok(new CashierUsersResponse(
                users,
                users.size(),
                verifiedCustomers.size(),
                restrictedCount
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> userDetails(@PathVariable Long id) {
        return userService.findById(id)
                .filter(user -> "USER".equals(user.getRole()) && user.isVerified())
                .<ResponseEntity<?>>map(user -> {
                    List<Booking> bookings = bookingService.getUserBookings(user);
                    long activeBookings = bookings.stream()
                            .filter(booking -> {
                                Booking.BookingStatus status = booking.getStatus();
                                return status == Booking.BookingStatus.RESERVED || status == Booking.BookingStatus.ARRIVED;
                            })
                            .count();

                    return ResponseEntity.ok(new CashierUserDetailsResponse(
                            user.getId(),
                            user.getFullName(),
                            user.getEmail(),
                            user.getPhoneNumber(),
                            user.getAddress(),
                            user.getPlateNumber(),
                            user.getVehicleType(),
                            user.getVehicleModel(),
                            user.getVehicleColor(),
                            user.isVerified(),
                            user.isCurrentlyBlocklisted(),
                            user.getBlocklistUntil() != null ? user.getBlocklistUntil().toString() : null,
                            user.getMissedBookingsCount(),
                            bookings.size(),
                            activeBookings
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        ApiErrorResponse.of("Verified user not found.")
                ));
    }

    private boolean matchesSearch(User user, String query) {
        return safe(user.getFullName()).toLowerCase(Locale.ROOT).contains(query)
                || safe(user.getEmail()).toLowerCase(Locale.ROOT).contains(query)
                || safe(user.getPlateNumber()).toLowerCase(Locale.ROOT).contains(query);
    }

    private UserSummaryDto toSummary(User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                safe(user.getAddress()),
                user.getPlateNumber(),
                user.isCurrentlyBlocklisted(),
                user.getBlocklistUntil() != null ? user.getBlocklistUntil().toString() : null
        );
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "Not provided" : value;
    }

    public record CashierUsersResponse(
            List<UserSummaryDto> users,
            int totalResults,
            int totalVerifiedUsers,
            long restrictedUsers
    ) {
    }

    public record UserSummaryDto(
            Long id,
            String fullName,
            String email,
            String phoneNumber,
            String address,
            String plateNumber,
            boolean blocklisted,
            String blocklistUntil
    ) {
    }

    public record CashierUserDetailsResponse(
            Long id,
            String fullName,
            String email,
            String phoneNumber,
            String address,
            String plateNumber,
            String vehicleType,
            String vehicleModel,
            String vehicleColor,
            boolean verified,
            boolean blocklisted,
            String blocklistUntil,
            int missedBookingsCount,
            int totalBookings,
            long activeBookings
    ) {
    }
}
