package com.appdev.set.service;

import com.appdev.set.model.ParkingCost;
import com.appdev.set.repository.ParkingCostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ParkingCostService {
    
    @Autowired
    private ParkingCostRepository parkingCostRepository;
    
    public ParkingCost getCurrentRate() {
        ParkingCost cost = parkingCostRepository.findFirstByOrderByIdAsc();
        
        if (cost == null) {
            // Initialize with default rate if not set
            cost = new ParkingCost();
            cost.setHourlyRate(5.0); // Default $5 per hour
            parkingCostRepository.save(cost);
        }
        
        return cost;
    }
    
    public ParkingCost updateRate(double hourlyRate) {
        ParkingCost cost = getCurrentRate();
        cost.setHourlyRate(hourlyRate);
        return parkingCostRepository.save(cost);
    }
}
