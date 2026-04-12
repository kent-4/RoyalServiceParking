package com.appdev.set.repository;

import com.appdev.set.model.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    
    List<ParkingSlot> findByLevel(String level);
    
    ParkingSlot findByLevelAndSlotName(String level, String slotName);
    
    long countByAvailable(boolean available);
}
