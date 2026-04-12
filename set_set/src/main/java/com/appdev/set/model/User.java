package com.appdev.set.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(unique = true)
    private String email;
    
    private LocalDate dateOfBirth;
    
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    
    @NotBlank(message = "Gender is required")
    private String gender;
    
    private String address;
    
    @NotBlank(message = "Plate number is required")
    private String plateNumber;
    
    @NotBlank(message = "Vehicle type is required")
    private String vehicleType;
    
    @NotBlank(message = "Vehicle model is required")
    private String vehicleModel;
    
    @NotBlank(message = "Vehicle color is required")
    private String vehicleColor;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    private boolean verified = false;
    
    private String verificationToken;
    
    private String resetToken;
    
    // Role field - default is USER
    private String role = "USER";
    
    // Blocklist fields
    private boolean blocklisted = false;
    private LocalDateTime blocklistUntil;
    private int missedBookingsCount = 0;
    
    @ManyToOne
    @JoinColumn(name = "parking_slot_id")
    private ParkingSlot assignedParkingSlot;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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

    public String getVehicleModel() {
        return vehicleModel;
    }

    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }

    public String getVehicleColor() {
        return vehicleColor;
    }

    public void setVehicleColor(String vehicleColor) {
        this.vehicleColor = vehicleColor;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getVerificationToken() {
        return verificationToken;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public boolean isBlocklisted() {
        return blocklisted;
    }
    
    public void setBlocklisted(boolean blocklisted) {
        this.blocklisted = blocklisted;
    }
    
    public LocalDateTime getBlocklistUntil() {
        return blocklistUntil;
    }
    
    public void setBlocklistUntil(LocalDateTime blocklistUntil) {
        this.blocklistUntil = blocklistUntil;
    }
    
    public int getMissedBookingsCount() {
        return missedBookingsCount;
    }
    
    public void setMissedBookingsCount(int missedBookingsCount) {
        this.missedBookingsCount = missedBookingsCount;
    }
    
    // Helper method to check if user is currently blocklisted
    public boolean isCurrentlyBlocklisted() {
        if (!blocklisted) {
            return false;
        }
        // If blocklistUntil is null, it's a permanent block
        if (blocklistUntil == null) {
            return true;
        }
        // Otherwise, check if the block is still active
        return blocklistUntil.isAfter(LocalDateTime.now());
    }
    
    // Helper method to get blocklist message
    public String getBlocklistMessage() {
        if (!isCurrentlyBlocklisted()) {
            return "Not blocklisted";
        }
        if (blocklistUntil == null) {
            return "Permanently blocklisted";
        }
        return "Blocklisted until " + blocklistUntil.toString();
    }

    public ParkingSlot getAssignedParkingSlot() {
        return assignedParkingSlot;
    }
    
    public void setAssignedParkingSlot(ParkingSlot assignedParkingSlot) {
        this.assignedParkingSlot = assignedParkingSlot;
    }
}
