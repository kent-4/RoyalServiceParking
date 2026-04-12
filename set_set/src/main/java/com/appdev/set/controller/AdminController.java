package com.appdev.set.controller;

import com.appdev.set.model.Booking;
import com.appdev.set.model.ParkingCost;
import com.appdev.set.model.User;
import com.appdev.set.service.BookingService;
import com.appdev.set.service.ParkingCostService;
import com.appdev.set.service.ParkingSlotService;
import com.appdev.set.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Optional;

@Controller
@RequestMapping("/admin")
public class AdminController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private ParkingCostService parkingCostService;
    
    @Autowired
    private ParkingSlotService parkingSlotService;
    
    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        System.out.println("DEBUG: AdminController dashboard method called");
        try {
            // Set default values to prevent null pointer exceptions
            long totalUsers = 0;
            long totalReserved = 0;
            long totalAvailable = 0;
            long totalParked = 0;
            
            try {
                totalUsers = userService.countVerifiedUsers();
            } catch (Exception e) {
                System.err.println("ERROR: Failed to get user count: " + e.getMessage());
            }
            
            try {
                totalReserved = bookingService.countReservedBookings();
            } catch (Exception e) {
                System.err.println("ERROR: Failed to get reserved count: " + e.getMessage());
            }
            
            try {
                totalAvailable = parkingSlotService.countAvailableSlots();
            } catch (Exception e) {
                System.err.println("ERROR: Failed to get available slots: " + e.getMessage());
            }
            
            try {
                totalParked = bookingService.countParkedBookings();
            } catch (Exception e) {
                System.err.println("ERROR: Failed to get parked count: " + e.getMessage());
            }
            
            System.out.println("DEBUG: Dashboard data - Users: " + totalUsers + ", Reserved: " + totalReserved + ", Available: " + totalAvailable + ", Parked: " + totalParked);
            
            model.addAttribute("totalUsers", totalUsers);
            model.addAttribute("totalReserved", totalReserved);
            model.addAttribute("totalAvailable", totalAvailable);
            model.addAttribute("totalParked", totalParked);
            
        } catch (Exception e) {
            System.err.println("ERROR: Error loading dashboard data: " + e.getMessage());
            e.printStackTrace();
            model.addAttribute("error", "Error loading dashboard data: " + e.getMessage());
            // Set default values even on error
            model.addAttribute("totalUsers", 0);
            model.addAttribute("totalReserved", 0);
            model.addAttribute("totalAvailable", 0);
            model.addAttribute("totalParked", 0);
        }
        
        System.out.println("DEBUG: Returning admin/dashboard template");
        return "admin/dashboard";
    }
    
    @GetMapping("/parking-cost")
    public String parkingCost(Model model) {
        try {
            ParkingCost cost = parkingCostService.getCurrentRate();
            model.addAttribute("parkingCost", cost);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get parking cost: " + e.getMessage());
            model.addAttribute("error", "Failed to load parking cost");
        }
        return "admin/parking-cost";
    }
    
    @PostMapping("/parking-cost")
    public String updateParkingCost(@RequestParam double hourlyRate, Model model) {
        try {
            ParkingCost cost = parkingCostService.updateRate(hourlyRate);
            model.addAttribute("parkingCost", cost);
            model.addAttribute("success", "Parking rate updated successfully");
        } catch (Exception e) {
            System.err.println("ERROR: Failed to update parking cost: " + e.getMessage());
            model.addAttribute("error", "Failed to update parking cost");
        }
        return "admin/parking-cost";
    }
    
    @GetMapping("/users")
    public String viewUsers(@RequestParam(value = "search", required = false) String search, Model model) {
        List<User> allUsers = userService.getAllUsers();
        // Only show verified users with role USER
        List<User> users = allUsers.stream()
            .filter(user -> "USER".equals(user.getRole()) && user.isVerified())
            .filter(user -> {
                if (search == null || search.isBlank()) return true;
                String q = search.toLowerCase();
                return user.getFullName().toLowerCase().contains(q)
                    || user.getEmail().toLowerCase().contains(q)
                    || (user.getPlateNumber() != null && user.getPlateNumber().toLowerCase().contains(q));
            })
            .toList();
        model.addAttribute("users", users);
        return "admin/users";
    }
    
    @GetMapping("/bookings")
    public String viewBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String slot,
            Model model) {
        try {
            System.out.println("DEBUG: Loading admin bookings view");
            List<Booking> bookings = bookingService.getAllBookings();
            System.out.println("DEBUG: Total bookings found: " + bookings.size());
            
            // Apply filters if provided
            if (status != null && !status.isEmpty()) {
                try {
                    System.out.println("DEBUG: Filtering by status: " + status);
                    Booking.BookingStatus statusEnum = Booking.BookingStatus.valueOf(status);
                    bookings = bookings.stream()
                        .filter(b -> b.getStatus() == statusEnum)
                        .collect(Collectors.toList());
                    System.out.println("DEBUG: Filtered bookings count: " + bookings.size());
                } catch (Exception e) {
                    System.out.println("DEBUG: Error filtering by status: " + e.getMessage());
                }
            }
            
            if (date != null && !date.isEmpty()) {
                try {
                    System.out.println("DEBUG: Filtering by date: " + date);
                    LocalDate filterDate = LocalDate.parse(date);
                    bookings = bookings.stream()
                        .filter(b -> b.getDate().equals(filterDate))
                        .collect(Collectors.toList());
                    System.out.println("DEBUG: Filtered bookings count: " + bookings.size());
                } catch (Exception e) {
                    System.out.println("DEBUG: Error filtering by date: " + e.getMessage());
                }
            }
            
            if (user != null && !user.isEmpty()) {
                System.out.println("DEBUG: Filtering by user: " + user);
                String userLower = user.toLowerCase();
                bookings = bookings.stream()
                    .filter(b -> b.getUser() != null && 
                               (b.getUser().getFullName().toLowerCase().contains(userLower) || 
                                b.getUser().getEmail().toLowerCase().contains(userLower)))
                    .collect(Collectors.toList());
                System.out.println("DEBUG: Filtered bookings count: " + bookings.size());
            }
            
            if (slot != null && !slot.isEmpty()) {
                System.out.println("DEBUG: Filtering by slot: " + slot);
                String slotLower = slot.toLowerCase();
                bookings = bookings.stream()
                    .filter(b -> b.getLevel().toLowerCase().contains(slotLower) || 
                                b.getSlotName().toLowerCase().contains(slotLower))
                    .collect(Collectors.toList());
                System.out.println("DEBUG: Filtered bookings count: " + bookings.size());
            }
            
            // Sort: by status, then by date and time (latest first)
            Map<String, Integer> statusOrder = new HashMap<>();
            statusOrder.put("RESERVED", 1);
            statusOrder.put("ARRIVED", 2);
            statusOrder.put("COMPLETED", 3);
            statusOrder.put("CANCELED", 4);

            bookings.sort((b1, b2) -> {
                String status1 = b1.getStatus().toString();
                String status2 = b2.getStatus().toString();
                int order1 = statusOrder.getOrDefault(status1, 5);
                int order2 = statusOrder.getOrDefault(status2, 5);
                if (order1 != order2) {
                    return Integer.compare(order1, order2);
                }
                int dateCompare = b2.getDate().compareTo(b1.getDate());
                if (dateCompare != 0) return dateCompare;
                return b2.getStartTime().compareTo(b1.getStartTime());
            });

            System.out.println("DEBUG: Final bookings count: " + bookings.size());
            model.addAttribute("bookings", bookings);
        } catch (Exception e) {
            System.out.println("DEBUG: Error in viewBookings: " + e.getMessage());
            e.printStackTrace();
            model.addAttribute("error", "Error loading bookings: " + e.getMessage());
        }
        return "admin/bookings";
    }
    
    @GetMapping("/blocklist")
    public String viewBlocklist(Model model) {
        try {
            List<User> blocklisted = userService.getBlocklistedUsers();
            model.addAttribute("blocklisted", blocklisted);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get blocklisted users: " + e.getMessage());
            model.addAttribute("error", "Failed to load blocklisted users");
        }
        return "admin/blocklist";
    }
    
    @PostMapping("/blocklist/{id}/remove")
    public String removeFromBlocklist(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            userService.removeFromBlocklist(id);
            redirectAttributes.addFlashAttribute("success", "User removed from blocklist");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error removing user from blocklist: " + e.getMessage());
        }
        return "redirect:/admin/users";
    }
    
    @PostMapping("/blocklist/add")
    public String addToBlocklist(
            @RequestParam Long userId,
            @RequestParam int duration,
            @RequestParam String reason,
            RedirectAttributes redirectAttributes) {
        try {
            userService.findById(userId).ifPresent(user -> {
                user.setBlocklisted(true);
                user.setMissedBookingsCount(user.getMissedBookingsCount() + 1);
                
                // Calculate blocklist end date based on duration
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime endDate;
                
                switch (duration) {
                    case 1:
                        endDate = now.plusWeeks(1); // 1 week
                        break;
                    case 3:
                        endDate = now.plusWeeks(3); // 3 weeks
                        break;
                    case 4:
                        endDate = now.plusMonths(1); // 1 month
                        break;
                    case 12:
                        endDate = now.plusMonths(3); // 3 months
                        break;
                    default:
                        endDate = now.plusWeeks(3); // Default to 3 weeks
                }
                
                user.setBlocklistUntil(endDate);
                userService.updateUser(user);
            });
            
            redirectAttributes.addFlashAttribute("success", "User added to blocklist successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error adding user to blocklist: " + e.getMessage());
        }
        
        return "redirect:/admin/users";
    }
    
    @GetMapping("/users/{id}")
    public String viewUserDetails(@PathVariable Long id, Model model) {
        try {
            Optional<User> userOpt = userService.findById(id);
            if (userOpt.isPresent() && userOpt.get().isVerified()) {
                User user = userOpt.get();
                model.addAttribute("user", user);
                return "admin/user-details";
            } else {
                model.addAttribute("error", "User not found or not verified");
                return "redirect:/admin/users";
            }
        } catch (Exception e) {
            model.addAttribute("error", "Error loading user details: " + e.getMessage());
            return "redirect:/admin/users";
        }
    }
}