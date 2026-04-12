package com.appdev.set.service;

import com.appdev.set.model.Booking;
import com.appdev.set.model.ParkingSlot;
import com.appdev.set.repository.BookingRepository;
import com.appdev.set.repository.ParkingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParkingSlotService {
    
    @Autowired
    private ParkingSlotRepository parkingSlotRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    /**
     * Initialize parking slots for all levels if they don't exist yet
     */
    @Transactional
    public void initializeParkingSlots() {
        // Check if slots are already initialized
        if (parkingSlotRepository.count() > 0) {
            System.out.println("Parking slots already initialized, skipping initialization");
            return;
        }
        
        System.out.println("Initializing parking slots for all levels");
        
        // Initialize parking slots for 4 levels with slots A-Z
        String[] levels = {"Level 1", "Level 2", "Level 3", "Level 4"};
        
        for (String level : levels) {
            // Create slots A to Z for each level
            for (char c = 'A'; c <= 'Z'; c++) {
                ParkingSlot slot = new ParkingSlot();
                slot.setLevel(level);
                slot.setSlotName("Slot " + c);
                slot.setAvailable(true);
                parkingSlotRepository.save(slot);
            }
            System.out.println("Created slots for " + level);
        }
        
        System.out.println("Parking slot initialization complete");
    }
    
    public List<ParkingSlot> getAllSlots() {
        return parkingSlotRepository.findAll();
    }
    
    public List<ParkingSlot> getSlotsByLevel(String level) {
        List<ParkingSlot> slots = parkingSlotRepository.findByLevel(level);
        
        // If no slots exist yet for this level, create them (A-Z)
        if (slots.isEmpty()) {
            slots = new ArrayList<>();
            for (char c = 'A'; c <= 'Z'; c++) {
                ParkingSlot slot = new ParkingSlot();
                slot.setLevel(level);
                slot.setSlotName("Slot " + c);
                slot.setAvailable(true);
                parkingSlotRepository.save(slot);
                slots.add(slot);
            }
        }
        
        // Ensure all slots A-Z exist for this level
        if (slots.size() < 26) {
            // Create a set of existing slot names
            java.util.Set<String> existingSlotNames = new java.util.HashSet<>();
            for (ParkingSlot slot : slots) {
                existingSlotNames.add(slot.getSlotName());
            }
            
            // Add any missing slots
            for (char c = 'A'; c <= 'Z'; c++) {
                String slotName = "Slot " + c;
                if (!existingSlotNames.contains(slotName)) {
                    ParkingSlot slot = new ParkingSlot();
                    slot.setLevel(level);
                    slot.setSlotName(slotName);
                    slot.setAvailable(true);
                    parkingSlotRepository.save(slot);
                    slots.add(slot);
                }
            }
        }
        
        return slots;
    }
    
    public ParkingSlot getSlotByLevelAndName(String level, String slotName) {
        return parkingSlotRepository.findByLevelAndSlotName(level, slotName);
    }
    
    @Transactional
    public ParkingSlot saveSlot(ParkingSlot slot) {
        return parkingSlotRepository.save(slot);
    }
    
    @Transactional
    public void deleteSlot(Long id) {
        parkingSlotRepository.deleteById(id);
    }
    
    /**
     * Count available slots
     */
    public long countAvailableSlots() {
        return parkingSlotRepository.countByAvailable(true);
    }
    
    /**
     * Get available slots for a specific level and date
     * This method checks both the physical availability of slots and existing bookings for the date
     */
    public List<ParkingSlot> getAvailableSlotsByLevelAndDate(String level, LocalDate date) {
        System.out.println("DEBUG - Getting available slots for level: " + level + " and date: " + date);
        
        // Get all slots for the level
        List<ParkingSlot> allSlots = parkingSlotRepository.findByLevel(level);
        
        // Get all active bookings (RESERVED or ARRIVED) for the level and date
        List<String> activeStatuses = List.of("RESERVED", "ARRIVED");
        List<Booking> activeBookings = bookingRepository.findByLevelAndDateAndStatusIn(level, date, activeStatuses);
        
        // Create a set of booked slot names for quick lookup
        List<String> bookedSlotNames = activeBookings.stream()
                .map(Booking::getSlotName)
                .collect(Collectors.toList());
        
        System.out.println("DEBUG - Found " + bookedSlotNames.size() + " booked slots for date " + date);
        
        // Filter out slots that are either physically unavailable or booked for this date
        List<ParkingSlot> availableSlots = allSlots.stream()
                .filter(slot -> slot.isAvailable() && !bookedSlotNames.contains(slot.getSlotName()))
                .collect(Collectors.toList());
        
        System.out.println("DEBUG - Returning " + availableSlots.size() + " available slots");
        return availableSlots;
    }
    
    /**
     * Get all active bookings for a slot regardless of date
     * This is used to check if a slot has any active bookings
     */
    public List<Booking> getActiveBookingsForSlot(String level, String slotName) {
        List<String> activeStatuses = List.of("RESERVED", "ARRIVED");
        return bookingRepository.findByLevelAndSlotNameAndStatusIn(level, slotName, activeStatuses);
    }
    
    /**
     * Check if a slot has any active bookings (regardless of date)
     */
    public boolean hasActiveBookings(String level, String slotName) {
        return !getActiveBookingsForSlot(level, slotName).isEmpty();
    }
    
    /**
     * Get available slots for a specific level, date and time
     * This adds time-based filtering on top of date-based filtering
     */
    public List<ParkingSlot> getAvailableSlotsByLevelDateAndTime(String level, LocalDate date, LocalTime time) {
        // First get slots available for the date
        List<ParkingSlot> dateAvailableSlots = getAvailableSlotsByLevelAndDate(level, date);
        
        // If no time specified, return date-available slots
        if (time == null) {
            return dateAvailableSlots;
        }
        
        System.out.println("DEBUG - Further filtering by time: " + time);
        
        // For time-based filtering, we would need additional logic here
        // For example, checking if there are any time-specific restrictions
        
        // For now, we'll just return the date-available slots
        return dateAvailableSlots;
    }
    
    /**
     * Check if a specific slot is available for a given date
     */
    public boolean isSlotAvailableForDate(String level, String slotName, LocalDate date) {
        // Check if the slot exists and is physically available
        ParkingSlot slot = parkingSlotRepository.findByLevelAndSlotName(level, slotName);
        if (slot == null || !slot.isAvailable()) {
            return false;
        }
        
        // Check if there are any active bookings for this slot on the given date
        List<String> activeStatuses = List.of("RESERVED", "ARRIVED");
        List<Booking> activeBookings = bookingRepository.findByLevelAndSlotNameAndDateAndStatusIn(
            level, slotName, date, activeStatuses);
        
        return activeBookings.isEmpty();
    }
    
    /**
     * Get slot availability status with detailed information
     * This provides more context about why a slot is unavailable
     */
    public SlotAvailabilityStatus getSlotAvailabilityStatus(String level, String slotName, LocalDate date) {
        // Check if the slot exists and is physically available
        ParkingSlot slot = parkingSlotRepository.findByLevelAndSlotName(level, slotName);
        if (slot == null) {
            return new SlotAvailabilityStatus(false, "Slot does not exist");
        }
        
        if (!slot.isAvailable()) {
            return new SlotAvailabilityStatus(false, "Slot is physically unavailable");
        }
        
        // Check if there are any active bookings for this slot (regardless of date)
        List<String> activeStatuses = List.of("RESERVED", "ARRIVED");
        List<Booking> allActiveBookings = bookingRepository.findByLevelAndSlotNameAndStatusIn(
            level, slotName, activeStatuses);
        
        if (!allActiveBookings.isEmpty()) {
            Booking activeBooking = allActiveBookings.get(0);
            return new SlotAvailabilityStatus(
                false, 
                "Slot is booked for " + activeBooking.getDate() + " at " + activeBooking.getStartTime(),
                activeBooking
            );
        }
        
        // Check if there are any active bookings for this slot on the given date
        List<Booking> dateActiveBookings = bookingRepository.findByLevelAndSlotNameAndDateAndStatusIn(
            level, slotName, date, activeStatuses);
        
        if (!dateActiveBookings.isEmpty()) {
            Booking activeBooking = dateActiveBookings.get(0);
            return new SlotAvailabilityStatus(
                false, 
                "Slot is booked for this date at " + activeBooking.getStartTime(),
                activeBooking
            );
        }
        
        return new SlotAvailabilityStatus(true, "Slot is available");
    }
    
    /**
     * Inner class to represent slot availability status with detailed information
     */
    public static class SlotAvailabilityStatus {
        private final boolean available;
        private final String message;
        private final Booking activeBooking;
        
        public SlotAvailabilityStatus(boolean available, String message) {
            this.available = available;
            this.message = message;
            this.activeBooking = null;
        }
        
        public SlotAvailabilityStatus(boolean available, String message, Booking activeBooking) {
            this.available = available;
            this.message = message;
            this.activeBooking = activeBooking;
        }
        
        public boolean isAvailable() {
            return available;
        }
        
        public String getMessage() {
            return message;
        }
        
        public Booking getActiveBooking() {
            return activeBooking;
        }
    }
}
