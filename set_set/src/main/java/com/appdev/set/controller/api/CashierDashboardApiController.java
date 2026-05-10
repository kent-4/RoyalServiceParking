package com.appdev.set.controller.api;

import com.appdev.set.service.BookingService;
import com.appdev.set.service.ParkingCostService;
import com.appdev.set.service.ParkingSlotService;
import com.appdev.set.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cashier")
public class CashierDashboardApiController {

    private final UserService userService;
    private final BookingService bookingService;
    private final ParkingSlotService parkingSlotService;
    private final ParkingCostService parkingCostService;

    public CashierDashboardApiController(
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

    @GetMapping("/dashboard")
    public ResponseEntity<CashierDashboardResponse> dashboard() {
        long totalUsers = userService.countVerifiedUsers();
        long totalReserved = bookingService.countReservedBookings();
        long totalAvailable = parkingSlotService.countAvailableSlots();
        long totalParked = bookingService.countParkedBookings();
        double currentHourlyRate = parkingCostService.getCurrentRate().getHourlyRate();

        return ResponseEntity.ok(new CashierDashboardResponse(
                totalUsers,
                totalReserved,
                totalAvailable,
                totalParked,
                currentHourlyRate
        ));
    }

    public record CashierDashboardResponse(
            long totalUsers,
            long totalReserved,
            long totalAvailable,
            long totalParked,
            double currentHourlyRate
    ) {
    }
}
