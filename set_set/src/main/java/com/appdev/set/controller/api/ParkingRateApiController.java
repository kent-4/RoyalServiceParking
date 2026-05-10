package com.appdev.set.controller.api;

import com.appdev.set.model.ParkingCost;
import com.appdev.set.service.ParkingCostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parking-rates")
public class ParkingRateApiController {

    private final ParkingCostService parkingCostService;

    public ParkingRateApiController(ParkingCostService parkingCostService) {
        this.parkingCostService = parkingCostService;
    }

    @GetMapping("/current")
    public ResponseEntity<ParkingRateResponse> currentRate() {
        ParkingCost rate = parkingCostService.getCurrentRate();
        return ResponseEntity.ok(new ParkingRateResponse(rate.getId(), rate.getHourlyRate()));
    }

    public record ParkingRateResponse(Long id, double hourlyRate) {
    }
}
