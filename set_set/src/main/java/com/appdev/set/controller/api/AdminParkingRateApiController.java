package com.appdev.set.controller.api;

import com.appdev.set.controller.api.response.ApiErrorResponse;
import com.appdev.set.model.ParkingCost;
import com.appdev.set.service.ParkingCostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/admin/parking-rates")
public class AdminParkingRateApiController {

    private final ParkingCostService parkingCostService;

    public AdminParkingRateApiController(ParkingCostService parkingCostService) {
        this.parkingCostService = parkingCostService;
    }

    @GetMapping("/current")
    public ResponseEntity<ParkingRateResponse> currentRate() {
        ParkingCost rate = parkingCostService.getCurrentRate();
        return ResponseEntity.ok(new ParkingRateResponse(rate.getId(), rate.getHourlyRate()));
    }

    @PutMapping("/current")
    public ResponseEntity<?> updateRate(@RequestBody UpdateParkingRateRequest request) {
        if (request == null || request.hourlyRate() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiErrorResponse.of("Hourly rate is required."));
        }

        double hourlyRate = request.hourlyRate();
        if (hourlyRate <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiErrorResponse.of("Hourly rate must be greater than zero."));
        }

        ParkingCost updated = parkingCostService.updateRate(hourlyRate);
        return ResponseEntity.ok(new ParkingRateResponse(updated.getId(), updated.getHourlyRate()));
    }

    public record UpdateParkingRateRequest(Double hourlyRate) {
    }

    public record ParkingRateResponse(Long id, double hourlyRate) {
    }
}
