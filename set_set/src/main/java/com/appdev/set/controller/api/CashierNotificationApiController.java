package com.appdev.set.controller.api;

import com.appdev.set.model.Booking;
import com.appdev.set.model.Notification;
import com.appdev.set.service.BookingService;
import com.appdev.set.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@RestController
@RequestMapping("/api/cashier/notifications")
public class CashierNotificationApiController {

    private final BookingService bookingService;
    private final NotificationService notificationService;

    public CashierNotificationApiController(BookingService bookingService, NotificationService notificationService) {
        this.bookingService = bookingService;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<CashierNotificationsResponse> notifications() {
        LocalDateTime now = LocalDateTime.now();
        List<CashierNotificationItemDto> items = new ArrayList<>();

        List<Notification> systemNotifications = notificationService.getSystemNotifications();
        for (Notification notification : systemNotifications) {
            if (Notification.NotificationType.SYSTEM_BLOCKLIST.name().equals(notification.getType())) {
                items.add(new CashierNotificationItemDto(
                        "system-" + notification.getId(),
                        "blocklist",
                        "danger",
                        notification.getTitle(),
                        notification.getMessage(),
                        notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : now.toString(),
                        false,
                        false,
                        Long.MAX_VALUE,
                        null,
                        null
                ));
            }
        }

        Set<Long> blocklistedUsersSeen = new HashSet<>();
        List<Booking> bookings = bookingService.getAllBookings();
        for (Booking booking : bookings) {
            Booking.BookingStatus status = booking.getStatus();
            boolean isReserved = status == Booking.BookingStatus.RESERVED;
            boolean isArrived = status == Booking.BookingStatus.ARRIVED;
            boolean userBlocklisted = booking.getUser() != null && booking.getUser().isBlocklisted();

            if (isReserved || isArrived) {
                items.add(toBookingNotification(booking, now));
            }

            if (userBlocklisted && booking.getUser() != null && blocklistedUsersSeen.add(booking.getUser().getId())) {
                items.add(toBlocklistNotification(booking, now));
            }
        }

        items.sort(notificationComparator());

        long currentCount = items.stream().filter(CashierNotificationItemDto::isPresent).count();
        long arrivedCount = items.stream().filter(CashierNotificationItemDto::isArrived).count();
        long blocklistCount = items.stream().filter(item -> "blocklist".equals(item.type())).count();

        return ResponseEntity.ok(new CashierNotificationsResponse(
                items,
                items.size(),
                currentCount,
                arrivedCount,
                blocklistCount
        ));
    }

    private CashierNotificationItemDto toBookingNotification(Booking booking, LocalDateTime now) {
        LocalDateTime bookingDateTime = LocalDateTime.of(booking.getDate(), booking.getStartTime());
        boolean isArrived = booking.getStatus() == Booking.BookingStatus.ARRIVED;
        boolean isPresent = isArrived || (
                now.isAfter(bookingDateTime.minusMinutes(30))
                        && now.isBefore(bookingDateTime.plusMinutes(30))
        );

        long minutesUntil = Duration.between(now, bookingDateTime).toMinutes();
        String timeStatus;
        if (isArrived) {
            timeStatus = "User has arrived";
        } else if (minutesUntil < 0) {
            timeStatus = String.format(Locale.ROOT, "(Late by %d min)", Math.abs(minutesUntil));
        } else if (minutesUntil < 60) {
            timeStatus = String.format(Locale.ROOT, "(In %d min)", minutesUntil);
        } else {
            long hours = minutesUntil / 60;
            long mins = minutesUntil % 60;
            timeStatus = mins == 0
                    ? String.format(Locale.ROOT, "(In %d hr)", hours)
                    : String.format(Locale.ROOT, "(In %d hr %d min)", hours, mins);
        }

        String prefix = isArrived
                ? "Arrived: "
                : isPresent
                    ? "Current booking: "
                    : "";

        String message = String.format(
                Locale.ROOT,
                "%s%s has %s slot %s at level %s for %s at %s %s. Vehicle: %s (%s %s)",
                prefix,
                safe(booking.getUser() != null ? booking.getUser().getFullName() : "Unknown user"),
                isArrived ? "arrived at" : "booked",
                safe(booking.getSlotName()),
                safe(booking.getLevel()),
                booking.getDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")),
                booking.getStartTime().format(DateTimeFormatter.ofPattern("hh:mm a")),
                timeStatus,
                safe(booking.getPlateNumber()),
                safe(booking.getUser() != null ? booking.getUser().getVehicleModel() : null),
                safe(booking.getUser() != null ? booking.getUser().getVehicleColor() : null)
        );

        return new CashierNotificationItemDto(
                "booking-" + booking.getId(),
                "booking",
                isArrived ? "info" : isPresent ? "warning" : "neutral",
                isArrived ? "User Arrived" : "Upcoming Booking",
                message,
                bookingDateTime.toString(),
                isPresent,
                isArrived,
                isArrived ? -999 : minutesUntil,
                booking.getId(),
                booking.getUser() != null ? booking.getUser().getId() : null
        );
    }

    private CashierNotificationItemDto toBlocklistNotification(Booking booking, LocalDateTime now) {
        String message = String.format(
                Locale.ROOT,
                "User %s (Vehicle: %s) is blocklisted until %s for missing %d bookings. Contact: %s",
                safe(booking.getUser() != null ? booking.getUser().getFullName() : "Unknown user"),
                safe(booking.getPlateNumber()),
                booking.getUser() != null && booking.getUser().getBlocklistUntil() != null
                        ? booking.getUser().getBlocklistUntil().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))
                        : "Not available",
                booking.getUser() != null ? booking.getUser().getMissedBookingsCount() : 0,
                safe(booking.getUser() != null ? booking.getUser().getPhoneNumber() : null)
        );

        return new CashierNotificationItemDto(
                "blocklist-" + (booking.getUser() != null ? booking.getUser().getId() : booking.getId()),
                "blocklist",
                "danger",
                "Blocklisted User",
                message,
                now.toString(),
                false,
                false,
                Long.MAX_VALUE,
                booking.getId(),
                booking.getUser() != null ? booking.getUser().getId() : null
        );
    }

    private Comparator<CashierNotificationItemDto> notificationComparator() {
        return (left, right) -> {
            if ("blocklist".equals(left.type()) && !"blocklist".equals(right.type())) return 1;
            if (!"blocklist".equals(left.type()) && "blocklist".equals(right.type())) return -1;

            if ("booking".equals(left.type()) && "booking".equals(right.type())) {
                if (left.isArrived() && !right.isArrived()) return 1;
                if (!left.isArrived() && right.isArrived()) return -1;

                if (!left.isArrived() && !right.isArrived()) {
                    if (left.isPresent() && !right.isPresent()) return -1;
                    if (!left.isPresent() && right.isPresent()) return 1;
                    return Long.compare(left.minutesUntil(), right.minutesUntil());
                }
            }

            return right.createdAt().compareTo(left.createdAt());
        };
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "Not provided" : value;
    }

    public record CashierNotificationsResponse(
            List<CashierNotificationItemDto> notifications,
            int totalCount,
            long currentBookingCount,
            long arrivedCount,
            long blocklistCount
    ) {
    }

    public record CashierNotificationItemDto(
            String id,
            String type,
            String tone,
            String title,
            String message,
            String createdAt,
            boolean isPresent,
            boolean isArrived,
            long minutesUntil,
            Long bookingId,
            Long userId
    ) {
    }
}
