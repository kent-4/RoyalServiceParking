package com.appdev.set.repository;

import com.appdev.set.model.ParkingCost;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParkingCostRepository extends JpaRepository<ParkingCost, Long> {
    ParkingCost findFirstByOrderByIdAsc();
}
