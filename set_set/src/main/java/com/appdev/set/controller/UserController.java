package com.appdev.set.controller;

import com.appdev.set.model.Booking;
import com.appdev.set.model.ParkingCost;
import com.appdev.set.model.ParkingSlot;
import com.appdev.set.model.User;
import com.appdev.set.service.BookingService;
import com.appdev.set.service.ParkingCostService;
import com.appdev.set.service.ParkingSlotService;
import com.appdev.set.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/user")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private ParkingSlotService parkingSlotService;
    
    @Autowired
    private ParkingCostService parkingCostService;
    
    // Helper method to get the current logged-in user
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByEmail(auth.getName())
        .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        System.out.println("DEBUG: UserController dashboard method called");
        try {
            User user = getCurrentUser();
            model.addAttribute("user", user);
            
            // Check if user is blocklisted
            if (user.isCurrentlyBlocklisted()) {
                model.addAttribute("blocklisted", true);
                model.addAttribute("blocklistMessage", user.getBlocklistMessage());
                model.addAttribute("blocklistUntil", user.getBlocklistUntil().toLocalDate());
            } else {
                model.addAttribute("blocklisted", false);
            }
            
            System.out.println("DEBUG: Returning user/dashboard template");
        } catch (Exception e) {
            System.err.println("ERROR: Error loading user dashboard: " + e.getMessage());
            e.printStackTrace();
            model.addAttribute("error", "Error loading dashboard: " + e.getMessage());
        }
        
        return "user/dashboard";
    }
    
    @GetMapping("/profile")
    public String profile(Model model) {
        User user = getCurrentUser();
        model.addAttribute("user", user);
        return "user/profile";
    }
    
    @PostMapping("/profile/update")
    public String updateProfile(@ModelAttribute User updatedUser, RedirectAttributes redirectAttributes) {
        User currentUser = getCurrentUser();
        
        // Update only allowed fields
        currentUser.setFullName(updatedUser.getFullName());
        currentUser.setPhoneNumber(updatedUser.getPhoneNumber());
        currentUser.setAddress(updatedUser.getAddress());
        currentUser.setPlateNumber(updatedUser.getPlateNumber());
        currentUser.setVehicleType(updatedUser.getVehicleType());
        currentUser.setVehicleModel(updatedUser.getVehicleModel());
        currentUser.setVehicleColor(updatedUser.getVehicleColor());
        
        userService.updateUser(currentUser);
        redirectAttributes.addFlashAttribute("success", "Profile updated successfully!");
        return "redirect:/user/profile";
    }
    
    @GetMapping("/bookings")
    public String viewBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String search,
            Model model) {
        User user = getCurrentUser();
        List<Booking> bookings = bookingService.getUserBookings(user);
        
        // Apply filters if provided
        if (status != null && !status.isEmpty()) {
            try {
                Booking.BookingStatus statusEnum = Booking.BookingStatus.valueOf(status);
                bookings = bookings.stream()
                    .filter(b -> b.getStatus() == statusEnum)
                    .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid status, ignore filter
            }
        }
        
        if (date != null && !date.isEmpty()) {
            try {
                LocalDate filterDate = LocalDate.parse(date);
                bookings = bookings.stream()
                    .filter(b -> b.getDate().equals(filterDate))
                    .collect(Collectors.toList());
            } catch (Exception e) {
                // Invalid date, ignore filter
            }
        }
        
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            bookings = bookings.stream()
                .filter(b -> 
                    String.valueOf(b.getId()).contains(searchLower) ||
                    (b.getUser() != null && b.getUser().getPlateNumber().toLowerCase().contains(searchLower)) ||
                    b.getLevel().toLowerCase().contains(searchLower) ||
                    b.getSlotName().toLowerCase().contains(searchLower))
                .collect(Collectors.toList());
        }
        
        // Sort bookings by status, then by date and time (latest first)
        Map<Booking.BookingStatus, Integer> statusOrder = new HashMap<>();
        statusOrder.put(Booking.BookingStatus.RESERVED, 1);
        statusOrder.put(Booking.BookingStatus.ARRIVED, 2);
        statusOrder.put(Booking.BookingStatus.COMPLETED, 3);
        statusOrder.put(Booking.BookingStatus.CANCELED, 4);
        
        bookings.sort((b1, b2) -> {
            int order1 = statusOrder.getOrDefault(b1.getStatus(), 5);
            int order2 = statusOrder.getOrDefault(b2.getStatus(), 5);
            if (order1 != order2) {
                return Integer.compare(order1, order2);
            }
            int dateCompare = b2.getDate().compareTo(b1.getDate());
            if (dateCompare != 0) return dateCompare;
            return b2.getStartTime().compareTo(b1.getStartTime());
        });
        
        model.addAttribute("bookings", bookings);
        
        // Check if user is blocklisted
        if (user.isCurrentlyBlocklisted()) {
            model.addAttribute("blocklisted", true);
            model.addAttribute("blocklistMessage", user.getBlocklistMessage());
            model.addAttribute("blocklistUntil", user.getBlocklistUntil().toLocalDate());
        } else {
            model.addAttribute("blocklisted", false);
        }
        
        return "user/bookings";
    }
    
    @GetMapping("/book")
    public String bookParking(Model model) {
        User user = getCurrentUser();
        
        // Always set blocklisted attribute (default to false)
        model.addAttribute("blocklisted", false);
        
        // Check if user is blocklisted
        if (user.isCurrentlyBlocklisted()) {
            model.addAttribute("blocklisted", true);
            model.addAttribute("blocklistMessage", user.getBlocklistMessage());
            model.addAttribute("blocklistUntil", user.getBlocklistUntil().toLocalDate());
        }
        
        // Get current parking rate
        ParkingCost currentRate = parkingCostService.getCurrentRate();
        model.addAttribute("hourlyRate", currentRate.getHourlyRate());
        
        // Add a new booking object for the form
        model.addAttribute("booking", new Booking());
        
        // Add total available parking slots information
        long totalAvailableSlots = parkingSlotService.countAvailableSlots();
        model.addAttribute("totalAvailableSlots", totalAvailableSlots);
        
        // Add available slots per level
        String[] levels = {"Level 1", "Level 2", "Level 3", "Level 4"};
        Map<String, Long> availableSlotsPerLevel = new HashMap<>();
        for (String level : levels) {
            List<ParkingSlot> availableSlots = parkingSlotService.getAvailableSlotsByLevelAndDate(level, LocalDate.now());
            availableSlotsPerLevel.put(level, (long) availableSlots.size());
        }
        model.addAttribute("availableSlotsPerLevel", availableSlotsPerLevel);
        
        return "user/book";
    }
    
    @GetMapping("/select-slot")
    public String selectSlot(
            @RequestParam String level,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String time,
            @RequestParam(required = false) String formattedDate,
            @RequestParam(required = false) String formattedTime,
            Model model,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        
        User user = getCurrentUser();
        
        // Check if user is blocklisted
        if (user.isCurrentlyBlocklisted()) {
            redirectAttributes.addFlashAttribute("error", user.getBlocklistMessage());
            return "redirect:/user/book";
        }
        
        System.out.println("DEBUG - selectSlot called with level: " + level);
        System.out.println("DEBUG - date parameter: " + date);
        System.out.println("DEBUG - time parameter: " + time);
        
        try {
            // Parse time if provided
            LocalTime parsedTime = null;
            if (time != null && !time.isEmpty()) {
                parsedTime = LocalTime.parse(time);
                System.out.println("DEBUG - Parsed time: " + parsedTime);
            } else {
                System.out.println("DEBUG - No time provided, skipping time-based filtering");
            }
            
            // Get all slots for the level
            List<ParkingSlot> allSlots = parkingSlotService.getSlotsByLevel(level);
            
            // Create a map to hold slot availability information
            Map<String, SlotAvailabilityInfo> slotAvailability = new HashMap<>();
            
            // Check availability for each slot
            for (ParkingSlot slot : allSlots) {
                // Check if the slot is available for this date
                boolean isAvailable = parkingSlotService.isSlotAvailableForDate(level, slot.getSlotName(), date);
                String message = isAvailable ? "Available for booking" : "This slot is already booked for this date";
                
                // Create availability info
                SlotAvailabilityInfo availabilityInfo = new SlotAvailabilityInfo(isAvailable, message);
                slotAvailability.put(slot.getSlotName(), availabilityInfo);
                
                // Set temporary unavailable flag for backward compatibility
                slot.setTemporaryUnavailable(!isAvailable);
            }
            
            // Store booking details in session
            session.setAttribute("bookingLevel", level);
            session.setAttribute("bookingDate", date.toString());
            if (parsedTime != null) {
                session.setAttribute("bookingTime", parsedTime.toString());
                // Calculate exit time (1 hour after start time)
                LocalTime exitTime = parsedTime.plusHours(1);
                session.setAttribute("exitTime", exitTime.toString());
            }
            session.setAttribute("formattedDate", formattedDate);
            session.setAttribute("formattedTime", formattedTime);
            
            model.addAttribute("level", level);
            model.addAttribute("date", date);
            model.addAttribute("time", time);
            model.addAttribute("slots", allSlots);
            model.addAttribute("slotAvailability", slotAvailability);
            model.addAttribute("formattedDate", formattedDate);
            model.addAttribute("formattedTime", formattedTime);
            
            return "user/select-slot";
            
        } catch (DateTimeParseException e) {
            System.err.println("ERROR in selectSlot: " + e.getMessage());
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Invalid time format. Please select a valid time.");
            return "redirect:/user/book";
        } catch (Exception e) {
            System.err.println("ERROR in selectSlot: " + e.getMessage());
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "An error occurred: " + e.getMessage());
            return "redirect:/user/book";
        }
    }
    
    /**
     * Inner class to represent slot availability information
     */
    public static class SlotAvailabilityInfo {
        private final boolean available;
        private final String message;
        
        public SlotAvailabilityInfo(boolean available, String message) {
            this.available = available;
            this.message = message;
        }
        
        public boolean isAvailable() {
            return available;
        }
        
        public String getMessage() {
            return message;
        }
    }
    
    @PostMapping("/book/confirm")
    public String confirmBooking(
            @RequestParam String level,
            @RequestParam String slotName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String exitTime,
            @RequestParam(required = false) String formattedDate,
            @RequestParam(required = false) String formattedTime,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        
        User user = getCurrentUser();
        
        // Check if user is blocklisted
        if (user.isCurrentlyBlocklisted()) {
            redirectAttributes.addFlashAttribute("error", user.getBlocklistMessage());
            return "redirect:/user/book";
        }
        
        try {
            // Parse times with validation
            LocalTime parsedStartTime;
            LocalTime parsedExitTime;
            
            // Check if startTime is empty or null
            if (startTime == null || startTime.isEmpty()) {
                // Try to get from session
                String sessionStartTime = (String) session.getAttribute("bookingTime");
                if (sessionStartTime == null || sessionStartTime.isEmpty()) {
                    redirectAttributes.addFlashAttribute("error", "Start time is required. Please select a time.");
                    return "redirect:/user/book";
                }
                parsedStartTime = LocalTime.parse(sessionStartTime);
            } else {
                parsedStartTime = LocalTime.parse(startTime);
            }
            
            // Check if exitTime is empty or null
            if (exitTime == null || exitTime.isEmpty()) {
                // Try to get from session
                String sessionExitTime = (String) session.getAttribute("exitTime");
                if (sessionExitTime == null || sessionExitTime.isEmpty()) {
                    // Default to 1 hour after start time
                    parsedExitTime = parsedStartTime.plusHours(1);
                } else {
                    parsedExitTime = LocalTime.parse(sessionExitTime);
                }
            } else {
                parsedExitTime = LocalTime.parse(exitTime);
            }
            
            System.out.println("DEBUG - Parsed start time: " + parsedStartTime);
            System.out.println("DEBUG - Parsed exit time: " + parsedExitTime);
            
            // Check if the slot is available for this date
            boolean isAvailable = parkingSlotService.isSlotAvailableForDate(level, slotName, date);
            if (!isAvailable) {
                redirectAttributes.addFlashAttribute("error", 
                    "Sorry, this slot is no longer available for the selected date. Please choose another slot.");
                return "redirect:/user/select-slot?level=" + level + "&date=" + date + 
                       "&time=" + startTime + "&formattedDate=" + formattedDate + "&formattedTime=" + formattedTime;
            }
            
            // Calculate hours
            long hours = java.time.temporal.ChronoUnit.HOURS.between(parsedStartTime, parsedExitTime);
            if (java.time.temporal.ChronoUnit.MINUTES.between(parsedStartTime, parsedExitTime) % 60 > 0) {
                hours++; // Round up for partial hours
            }
            
            // Ensure at least 1 hour
            if (hours < 1) {
                hours = 1;
            }
            
            // Calculate cost
            ParkingCost currentRate = parkingCostService.getCurrentRate();
            double cost = hours * currentRate.getHourlyRate();
            
            // Create booking
            Booking booking = new Booking();
            booking.setUser(user);
            booking.setLevel(level);
            booking.setSlotName(slotName);
            booking.setDate(date);
            booking.setStartTime(parsedStartTime);
            booking.setExitTime(parsedExitTime);
            booking.setParkingHours((int) hours);
            booking.setParkingCost(cost);
            booking.setStatus(Booking.BookingStatus.RESERVED);
            booking.setPlateNumber(user.getPlateNumber());
            booking.setVehicleType(user.getVehicleType());
            
            // Save booking
            bookingService.createBooking(booking);
            
            redirectAttributes.addFlashAttribute("success", 
                "Booking confirmed! Your slot " + slotName + " at " + level + " is reserved for " + 
                formattedDate + " at " + formattedTime + ".");
            
            return "redirect:/user/bookings";
            
        } catch (DateTimeParseException e) {
            System.err.println("ERROR in confirmBooking: " + e.getMessage());
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Invalid time format. Please select a valid time.");
            return "redirect:/user/book";
        } catch (Exception e) {
            System.err.println("ERROR in confirmBooking: " + e.getMessage());
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "An error occurred: " + e.getMessage());
            return "redirect:/user/book";
        }
    }
    
    @GetMapping("/parking-cost")
    public String viewParkingCost(Model model) {
        ParkingCost parkingCost = parkingCostService.getCurrentRate();
        model.addAttribute("parkingCost", parkingCost);
        return "user/parking-cost";
    }
    
    @PostMapping("/cancel-booking/{id}")
    public String cancelBooking(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            Optional<Booking> bookingOpt = bookingService.getBookingById(id);
            
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                User currentUser = getCurrentUser();
                
                // Verify that the booking belongs to the current user
                if (!booking.getUser().getId().equals(currentUser.getId())) {
                    redirectAttributes.addFlashAttribute("error", "You can only cancel your own bookings.");
                    return "redirect:/user/bookings";
                }
                
                // Check if the booking can be canceled (only RESERVED bookings can be canceled)
                if (booking.getStatus() != Booking.BookingStatus.RESERVED) {
                    redirectAttributes.addFlashAttribute("error", 
                        "Only reserved bookings can be canceled. This booking is " + booking.getStatus() + ".");
                    return "redirect:/user/bookings";
                }
                
                // Cancel the booking
                bookingService.updateBookingStatus(id, Booking.BookingStatus.CANCELED);
                redirectAttributes.addFlashAttribute("success", "Booking canceled successfully.");
            } else {
                redirectAttributes.addFlashAttribute("error", "Booking not found.");
            }
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "An error occurred: " + e.getMessage());
        }
        
        return "redirect:/user/bookings";
    }
}