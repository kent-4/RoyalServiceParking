package com.appdev.set.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private LocalDate date;
    
    private LocalTime startTime;
    
    private LocalTime exitTime;
    
    private int parkingHours;
    
    private double parkingCost;
    
    private String paymentMode;
    
    private String level;
    
    private String slotName;
    
    @Column(name = "plate_number", nullable = false)
    private String plateNumber;
    
    @Column(name = "vehicle_type", nullable = false)
    private String vehicleType;
    
    // Change from ENUM to String to avoid database schema issues
    private String status = "PENDING";
    
    // Fields for tracking arrival
    private boolean arrived = false;
    private LocalDateTime arrivalTime;
    private boolean autoExpired = false;
    private boolean reminderSent = false;
    
    // Enum for booking status - used for code clarity but not for database storage
    public enum BookingStatus {
        PENDING, RESERVED, ARRIVED, COMPLETED, CANCELED;
        
        @Override
        public String toString() {
            return name();
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalTime getExitTime() {
        return exitTime;
    }
    
    public void setExitTime(LocalTime exitTime) {
        this.exitTime = exitTime;
    }

    public int getParkingHours() {
        return parkingHours;
    }

    public void setParkingHours(int parkingHours) {
        this.parkingHours = parkingHours;
    }

    public double getParkingCost() {
        return parkingCost;
    }

    public void setParkingCost(double parkingCost) {
        this.parkingCost = parkingCost;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getSlotName() {
        return slotName;
    }

    public void setSlotName(String slotName) {
        this.slotName = slotName;
    }

    public String getPlateNumber() {
        return plateNumber;
    }

    public void setPlateNumber(String plateNumber) {
        this.plateNumber = plateNumber;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public BookingStatus getStatus() {
        try {
            return status != null ? BookingStatus.valueOf(status) : BookingStatus.PENDING;
        } catch (IllegalArgumentException e) {
            return BookingStatus.PENDING;
        }
    }

    public void setStatus(BookingStatus status) {
        this.status = status != null ? status.toString() : BookingStatus.PENDING.toString();
    }
    
    public boolean isArrived() {
        return arrived;
    }
    
    public void setArrived(boolean arrived) {
        this.arrived = arrived;
    }
    
    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }
    
    public void setArrivalTime(LocalDateTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }
    
    public boolean isAutoExpired() {
        return autoExpired;
    }
    
    public void setAutoExpired(boolean autoExpired) {
        this.autoExpired = autoExpired;
    }
    
    public boolean isReminderSent() {
        return reminderSent;
    }
    
    public void setReminderSent(boolean reminderSent) {
        this.reminderSent = reminderSent;
    }
    
    // Helper method to check if booking should be auto-expired
    public boolean shouldAutoExpire() {
        if (arrived || !status.equals("RESERVED")) {
            return false;
        }
        
        // Get the expected arrival deadline (booking date + start time + 1 hour)
        LocalDateTime bookingDateTime = LocalDateTime.of(date, startTime);
        LocalDateTime deadline = bookingDateTime.plusHours(1);
        
        return LocalDateTime.now().isAfter(deadline);
    }
}
