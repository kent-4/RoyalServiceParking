package com.appdev.set.model;

import jakarta.persistence.*;

@Entity
@Table(name = "parking_slots")
public class ParkingSlot {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String level;
    
    private String slotName;
    
    private boolean available = true;
    
    @Transient // This field is not persisted to the database
    private boolean temporaryUnavailable = false;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public boolean isAvailable() {
        return available;
    }
    
    public void setAvailable(boolean available) {
        this.available = available;
    }
    
    public boolean isTemporaryUnavailable() {
        return temporaryUnavailable;
    }
    
    public void setTemporaryUnavailable(boolean temporaryUnavailable) {
        this.temporaryUnavailable = temporaryUnavailable;
    }
}
