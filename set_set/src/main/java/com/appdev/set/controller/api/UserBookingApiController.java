package com.appdev.set.controller.api;

import com.appdev.set.model.Booking;
import com.appdev.set.model.ParkingCost;
import com.appdev.set.model.ParkingSlot;
import com.appdev.set.model.User;
import com.appdev.set.service.BookingService;
import com.appdev.set.service.ParkingCostService;
import com.appdev.set.service.ParkingSlotService;
import com.appdev.set.service.UserService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserBookingApiController {

    private static final List<String> LEVELS = List.of("Level 1", "Level 2", "Level 3", "Level 4");
    private static final Map<Booking.BookingStatus, Integer> STATUS_ORDER = Map.of(
            Booking.BookingStatus.RESERVED, 1,
            Booking.BookingStatus.ARRIVED, 2,
            Booking.BookingStatus.COMPLETED, 3,
            Booking.BookingStatus.CANCELED, 4
    );

    private final UserService userService;
    private final BookingService bookingService;
    private final ParkingSlotService parkingSlotService;
    private final ParkingCostService parkingCostService;

    public UserBookingApiController(
            UserService userService,
            BookingService bookingService,
            ParkingSlotService parkingSlotService,
            ParkingCostService parkingCostService
    ) {
        this.userService = userService;
        this.bookingService = bookingService;
        this.parkingSlotService = parkingSlotService;
        this.parkingCostService = parkingCostService;
    }

    @GetMapping("/booking-context")
    public ResponseEntity<?> bookingContext(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        User user = currentUser(authentication);
        LocalDate selectedDate;
        try {
            selectedDate = resolveBookingDate(date);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
        ParkingCost currentRate = parkingCostService.getCurrentRate();
        BookingSummaryDto activeBooking = activeBookingSummary(user);

        List<LevelAvailabilityDto> levels = LEVELS.stream()
                .map(level -> new LevelAvailabilityDto(
                        level,
                        parkingSlotService.getAvailableSlotsByLevelAndDate(level, selectedDate).size()
                ))
                .toList();

        long totalAvailableSlots = levels.stream()
                .mapToLong(LevelAvailabilityDto::availableSlots)
                .sum();

        return ResponseEntity.ok(new BookingContextResponse(
                selectedDate.toString(),
                LocalDate.now().toString(),
                LocalDate.now().plusDays(3).toString(),
                currentRate.getHourlyRate(),
                totalAvailableSlots,
                levels,
                user.isCurrentlyBlocklisted(),
                user.getBlocklistMessage(),
                user.getBlocklistUntil() != null ? user.getBlocklistUntil().toString() : null,
                activeBooking,
                "Please arrive within 1 hour of the scheduled booking time to avoid automatic cancellation and temporary restriction."
        ));
    }

    @GetMapping("/bookings/slots")
    public ResponseEntity<?> slotSelection(
            Authentication authentication,
            @RequestParam String level,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String startTime
    ) {
        User user = currentUser(authentication);
        LocalDate selectedDate;
        try {
            selectedDate = resolveBookingDate(date);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }

        if (!LEVELS.contains(level)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Select a valid parking level."));
        }

        LocalTime parsedStartTime;
        try {
            parsedStartTime = LocalTime.parse(startTime);
        } catch (DateTimeParseException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", "Select a valid booking start time."));
        }

        LocalTime exitTime = parsedStartTime.plusHours(1);
        double hourlyRate = parkingCostService.getCurrentRate().getHourlyRate();
        BookingSummaryDto activeBooking = activeBookingSummary(user);

        List<SlotAvailabilityDto> slots = parkingSlotService.getSlotsByLevel(level).stream()
                .sorted(Comparator.comparing(ParkingSlot::getSlotName))
                .map(slot -> {
                    ParkingSlotService.SlotAvailabilityStatus status =
                            parkingSlotService.getSlotAvailabilityStatus(level, slot.getSlotName(), selectedDate);
                    return new SlotAvailabilityDto(
                            slot.getSlotName(),
                            status.isAvailable(),
                            status.getMessage()
                    );
                })
                .toList();

        return ResponseEntity.ok(new SlotSelectionResponse(
                level,
                selectedDate.toString(),
                parsedStartTime.toString(),
                exitTime.toString(),
                1,
                hourlyRate,
                hourlyRate,
                user.isCurrentlyBlocklisted(),
                user.getBlocklistMessage(),
                user.getBlocklistUntil() != null ? user.getBlocklistUntil().toString() : null,
                activeBooking,
                slots
        ));
    }

    @GetMapping("/bookings")
    public ResponseEntity<UserBookingsResponse> userBookings(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String search
    ) {
        User user = currentUser(authentication);
        List<Booking> bookings = new ArrayList<>(bookingService.getUserBookings(user));
        Booking.BookingStatus statusFilter = parseStatus(status);
        String searchValue = search != null ? search.trim().toLowerCase() : "";

        if (statusFilter != null) {
            bookings = bookings.stream()
                    .filter(booking -> booking.getStatus() == statusFilter)
                    .collect(Collectors.toList());
        }

        if (date != null) {
            bookings = bookings.stream()
                    .filter(booking -> date.equals(booking.getDate()))
                    .collect(Collectors.toList());
        }

        if (!searchValue.isEmpty()) {
            bookings = bookings.stream()
                    .filter(booking ->
                            String.valueOf(booking.getId()).contains(searchValue)
                                    || safe(booking.getPlateNumber()).toLowerCase().contains(searchValue)
                                    || safe(booking.getLevel()).toLowerCase().contains(searchValue)
                                    || safe(booking.getSlotName()).toLowerCase().contains(searchValue))
                    .collect(Collectors.toList());
        }

        bookings.sort((left, right) -> {
            int leftOrder = STATUS_ORDER.getOrDefault(left.getStatus(), 5);
            int rightOrder = STATUS_ORDER.getOrDefault(right.getStatus(), 5);
            if (leftOrder != rightOrder) {
                return Integer.compare(leftOrder, rightOrder);
            }

            int dateCompare = right.getDate().compareTo(left.getDate());
            if (dateCompare != 0) {
                return dateCompare;
            }

            return right.getStartTime().compareTo(left.getStartTime());
        });

        long reservedCount = bookings.stream()
                .filter(booking -> booking.getStatus() == Booking.BookingStatus.RESERVED)
                .count();
        long arrivedCount = bookings.stream()
                .filter(booking -> booking.getStatus() == Booking.BookingStatus.ARRIVED)
                .count();
        long completedCount = bookings.stream()
                .filter(booking -> booking.getStatus() == Booking.BookingStatus.COMPLETED)
                .count();
        long canceledCount = bookings.stream()
                .filter(booking -> booking.getStatus() == Booking.BookingStatus.CANCELED)
                .count();

        List<UserBookingListItemDto> items = bookings.stream()
                .map(this::toUserBookingListItem)
                .toList();

        return ResponseEntity.ok(new UserBookingsResponse(
                items,
                items.size(),
                reservedCount,
                arrivedCount,
                completedCount,
                canceledCount,
                user.isCurrentlyBlocklisted(),
                user.getBlocklistMessage(),
                user.getBlocklistUntil() != null ? user.getBlocklistUntil().toString() : null
        ));
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(
            Authentication authentication,
            @RequestBody CreateBookingRequest request
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();

        if (!LEVELS.contains(request.level())) {
            fieldErrors.put("level", "Select a valid parking level.");
        }
        if (isBlank(request.slotName())) {
            fieldErrors.put("slotName", "Select a parking slot.");
        }
        if (request.date() == null) {
            fieldErrors.put("date", "Booking date is required.");
        }
        if (isBlank(request.startTime())) {
            fieldErrors.put("startTime", "Booking start time is required.");
        }

        LocalTime parsedStartTime = null;
        if (!fieldErrors.containsKey("startTime")) {
            try {
                parsedStartTime = LocalTime.parse(request.startTime());
            } catch (DateTimeParseException exception) {
                fieldErrors.put("startTime", "Select a valid booking start time.");
            }
        }

        if (!fieldErrors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ValidationErrorResponse(
                    "Review the booking details and try again.",
                    fieldErrors
            ));
        }

        User user = currentUser(authentication);
        LocalDate selectedDate;
        try {
            selectedDate = resolveBookingDate(request.date());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setLevel(request.level());
        booking.setSlotName(request.slotName().trim());
        booking.setDate(selectedDate);
        booking.setStartTime(parsedStartTime);
        booking.setExitTime(parsedStartTime.plusHours(1));
        booking.setParkingHours(1);
        booking.setParkingCost(parkingCostService.getCurrentRate().getHourlyRate());
        booking.setPlateNumber(user.getPlateNumber());
        booking.setVehicleType(user.getVehicleType());
        booking.setPaymentMode("Cash");
        booking.setStatus(Booking.BookingStatus.RESERVED);

        try {
            Booking savedBooking = bookingService.createBooking(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(new BookingCreatedResponse(
                    savedBooking.getId(),
                    "Booking confirmed successfully.",
                    toUserBookingListItem(savedBooking)
            ));
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", exception.getMessage()));
        }
    }

    @PostMapping("/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(Authentication authentication, @PathVariable Long id) {
        User currentUser = currentUser(authentication);
        Optional<Booking> bookingOpt = bookingService.getBookingById(id);

        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Booking not found."));
        }

        Booking booking = bookingOpt.get();
        if (!booking.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "You can only cancel your own bookings."));
        }

        if (booking.getStatus() != Booking.BookingStatus.RESERVED) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Only reserved bookings can be canceled."
            ));
        }

        Booking updated = bookingService.updateBookingStatus(id, Booking.BookingStatus.CANCELED);
        return ResponseEntity.ok(new BookingMutationResponse(
                "Booking canceled successfully.",
                toUserBookingListItem(updated)
        ));
    }

    private User currentUser(Authentication authentication) {
        return userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private LocalDate resolveBookingDate(LocalDate date) {
        LocalDate selectedDate = date != null ? date : LocalDate.now();
        LocalDate minDate = LocalDate.now();
        LocalDate maxDate = minDate.plusDays(3);

        if (selectedDate.isBefore(minDate) || selectedDate.isAfter(maxDate)) {
            throw new IllegalArgumentException("Bookings are limited to today through three days in advance.");
        }

        return selectedDate;
    }

    private BookingSummaryDto activeBookingSummary(User user) {
        List<Booking> bookings = bookingService.getUserBookings(user);

        return bookings.stream()
                .filter(booking -> {
                    Booking.BookingStatus status = booking.getStatus();
                    return status == Booking.BookingStatus.RESERVED || status == Booking.BookingStatus.ARRIVED;
                })
                .sorted(Comparator.comparing(Booking::getDate).thenComparing(Booking::getStartTime))
                .map(booking -> new BookingSummaryDto(
                        booking.getId(),
                        booking.getDate().toString(),
                        booking.getStartTime() != null ? booking.getStartTime().toString() : null,
                        booking.getLevel(),
                        booking.getSlotName(),
                        booking.getStatus().name()
                ))
                .findFirst()
                .orElse(null);
    }

    private Booking.BookingStatus parseStatus(String status) {
        if (isBlank(status)) {
            return null;
        }

        try {
            return Booking.BookingStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private UserBookingListItemDto toUserBookingListItem(Booking booking) {
        return new UserBookingListItemDto(
                booking.getId(),
                booking.getUser() != null ? booking.getUser().getFullName() : null,
                booking.getPlateNumber(),
                booking.getVehicleType(),
                booking.getDate() != null ? booking.getDate().toString() : null,
                booking.getStartTime() != null ? booking.getStartTime().toString() : null,
                booking.getExitTime() != null ? booking.getExitTime().toString() : null,
                booking.getLevel(),
                booking.getSlotName(),
                booking.getParkingCost(),
                booking.getStatus().name(),
                booking.getStatus() == Booking.BookingStatus.RESERVED
        );
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public record BookingContextResponse(
            String selectedDate,
            String minBookingDate,
            String maxBookingDate,
            double hourlyRate,
            long totalAvailableSlots,
            List<LevelAvailabilityDto> availableSlotsPerLevel,
            boolean blocklisted,
            String blocklistMessage,
            String blocklistUntil,
            BookingSummaryDto activeBooking,
            String noShowPolicy
    ) {
    }

    public record LevelAvailabilityDto(String level, long availableSlots) {
    }

    public record SlotSelectionResponse(
            String level,
            String date,
            String startTime,
            String exitTime,
            int estimatedHours,
            double hourlyRate,
            double estimatedCost,
            boolean blocklisted,
            String blocklistMessage,
            String blocklistUntil,
            BookingSummaryDto activeBooking,
            List<SlotAvailabilityDto> slots
    ) {
    }

    public record SlotAvailabilityDto(String slotName, boolean available, String message) {
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

    public record UserBookingsResponse(
            List<UserBookingListItemDto> bookings,
            int totalResults,
            long reservedCount,
            long arrivedCount,
            long completedCount,
            long canceledCount,
            boolean blocklisted,
            String blocklistMessage,
            String blocklistUntil
    ) {
    }

    public record UserBookingListItemDto(
            Long id,
            String fullName,
            String plateNumber,
            String vehicleType,
            String date,
            String startTime,
            String exitTime,
            String level,
            String slotName,
            double parkingCost,
            String status,
            boolean cancellable
    ) {
    }

    public record CreateBookingRequest(
            String level,
            String slotName,
            LocalDate date,
            String startTime
    ) {
    }

    public record BookingCreatedResponse(Long bookingId, String message, UserBookingListItemDto booking) {
    }

    public record BookingMutationResponse(String message, UserBookingListItemDto booking) {
    }

    public record ValidationErrorResponse(String message, Map<String, String> fieldErrors) {
    }
}
