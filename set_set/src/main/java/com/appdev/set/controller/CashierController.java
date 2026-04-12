package com.appdev.set.controller;

import com.appdev.set.model.Booking;
import com.appdev.set.model.ParkingCost;
import com.appdev.set.model.User;
import com.appdev.set.service.BookingService;
import com.appdev.set.service.ParkingCostService;
import com.appdev.set.service.UserService;
import com.appdev.set.service.ParkingSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import com.appdev.set.model.Notification;
import com.appdev.set.service.NotificationService;

@Controller
@RequestMapping("/cashier")
public class CashierController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private ParkingCostService parkingCostService;

    @Autowired
    private ParkingSlotService parkingSlotService;
    
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        System.out.println("DEBUG: CashierController dashboard method called");
        try {
            long totalUsers = userService.countVerifiedUsers();
            long totalReserved = bookingService.countReservedBookings();
            long totalAvailable = parkingSlotService.countAvailableSlots();
            long totalParked = bookingService.countParkedBookings();
        
            System.out.println("DEBUG: Dashboard data - Users: " + totalUsers + ", Reserved: " + totalReserved + ", Available: " + totalAvailable + ", Parked: " + totalParked);
            
            model.addAttribute("totalUsers", totalUsers);
            model.addAttribute("totalReserved", totalReserved);
            model.addAttribute("totalAvailable", totalAvailable);
            model.addAttribute("totalParked", totalParked);
        } catch (Exception e) {
            System.err.println("ERROR: Error loading dashboard data: " + e.getMessage());
            e.printStackTrace();
            model.addAttribute("error", "Error loading dashboard data: " + e.getMessage());
        }
        
        System.out.println("DEBUG: Returning cashier/dashboard template");
        return "cashier/dashboard";
    }
    
    @GetMapping("/parking-cost")
    public String viewParkingCost(Model model) {
        ParkingCost cost = parkingCostService.getCurrentRate();
        model.addAttribute("parkingCost", cost);
        return "cashier/parking-cost";
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
        return "cashier/users";
    }
    
    @GetMapping("/users/{id}")
    public String viewUserDetails(@PathVariable Long id, Model model) {
        try {
            Optional<User> userOpt = userService.findById(id);
            if (userOpt.isPresent() && userOpt.get().isVerified()) {
                User user = userOpt.get();
                model.addAttribute("user", user);
                return "cashier/user-details";
            } else {
                model.addAttribute("error", "User not found or not verified");
                return "redirect:/cashier/users";
            }
        } catch (Exception e) {
            model.addAttribute("error", "Error loading user details: " + e.getMessage());
            return "redirect:/cashier/users";
        }
    }
    
    @GetMapping("/bookings")
    public String viewBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String slot,
            Model model) {
        try {
            List<Booking> bookings = bookingService.getAllBookings();
            
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
            
            if (slot != null && !slot.isEmpty()) {
                String slotLower = slot.toLowerCase();
                bookings = bookings.stream()
                    .filter(b -> b.getLevel().toLowerCase().contains(slotLower) || 
                                b.getSlotName().toLowerCase().contains(slotLower))
                    .collect(Collectors.toList());
            }
            
            // Sort: by status, then by date and time (latest first)
            java.util.Map<Booking.BookingStatus, Integer> statusOrder = new java.util.HashMap<>();
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
        } catch (Exception e) {
            model.addAttribute("error", "Error loading bookings: " + e.getMessage());
        }
        return "cashier/bookings";
    }
    
    @GetMapping("/bookings/{id}/edit")
    public String editBooking(@PathVariable Long id, Model model) {
        try {
            Optional<Booking> bookingOpt = bookingService.getBookingById(id);
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                model.addAttribute("booking", booking);
                model.addAttribute("parkingCost", parkingCostService.getCurrentRate());
                
                // Calculate preview values using current date and time
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                java.time.LocalTime previewExitTime = now.toLocalTime();
                model.addAttribute("previewExitTime", previewExitTime);
                
                // Create LocalDateTime for start using booking date and time
                java.time.LocalDateTime startDateTime = java.time.LocalDateTime.of(
                    booking.getDate(),
                    booking.getStartTime()
                );
                
                // Calculate total minutes between start datetime and current datetime
                long totalMinutes = java.time.Duration.between(startDateTime, now).toMinutes();
                
                // If total minutes is negative (future date/time), set to minimum 1 hour
                if (totalMinutes < 0) {
                    totalMinutes = 0;
                }
                
                // Calculate hours, rounding up partial hours
                long hours = (totalMinutes + 59) / 60; // Round up
                
                // Minimum 1 hour charge
                if (hours < 1) {
                    hours = 1;
                }
                
                double hourlyRate = parkingCostService.getCurrentRate().getHourlyRate();
                double previewCost = hours * hourlyRate;
                
                // Add number of days and hours to the model for display
                long days = hours / 24;
                long remainingHours = hours % 24;
                model.addAttribute("parkingDays", days);
                model.addAttribute("parkingHours", remainingHours);
                model.addAttribute("totalHours", hours);
                model.addAttribute("previewCost", previewCost);
                
                return "cashier/edit-booking";
            } else {
                return "redirect:/cashier/bookings";
            }
        } catch (Exception e) {
            model.addAttribute("error", "Error loading booking: " + e.getMessage());
            return "redirect:/cashier/bookings";
        }
    }
    
    @PostMapping("/bookings/{id}/update")
    public String updateBooking(
            @PathVariable Long id,
            @RequestParam("startTime") @DateTimeFormat(pattern = "HH:mm") LocalTime startTime,
            @RequestParam("exitTime") @DateTimeFormat(pattern = "HH:mm") LocalTime exitTime,
            RedirectAttributes redirectAttributes) {
        
        try {
            Booking updatedBooking = bookingService.updateBookingTimes(id, startTime, exitTime);
            redirectAttributes.addFlashAttribute("success", "Booking updated successfully");
            return "redirect:/cashier/bookings";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error updating booking: " + e.getMessage());
            return "redirect:/cashier/bookings/" + id + "/edit";
        }
    }
    
    @PostMapping("/bookings/{id}/arrive")
    public String markUserArrived(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            bookingService.markUserArrived(id);
            redirectAttributes.addFlashAttribute("success", "User marked as arrived");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error marking arrival: " + e.getMessage());
        }
        return "redirect:/cashier/bookings";
    }
    
    @PostMapping("/bookings/{id}/complete")
    public String completeBooking(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            Booking completedBooking = bookingService.updateBookingStatus(id, Booking.BookingStatus.COMPLETED);
            redirectAttributes.addFlashAttribute("success", "Payment completed successfully");
            return "redirect:/cashier/bookings/" + id + "/receipt";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error completing booking: " + e.getMessage());
            return "redirect:/cashier/bookings";
        }
    }

    @GetMapping("/bookings/{id}/receipt")
    public String viewReceipt(@PathVariable Long id, Model model) {
        try {
            Optional<Booking> bookingOpt = bookingService.getBookingById(id);
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                model.addAttribute("booking", booking);
                
                // Calculate parking duration
                long totalHours = booking.getParkingHours();
                long days = totalHours / 24;
                long remainingHours = totalHours % 24;
                
                model.addAttribute("parkingDays", days);
                model.addAttribute("parkingHours", remainingHours);
                model.addAttribute("totalHours", totalHours);
                model.addAttribute("parkingCost", parkingCostService.getCurrentRate());
                model.addAttribute("previewCost", booking.getParkingCost());
                model.addAttribute("previewExitTime", booking.getExitTime());
                
                return "cashier/receipt";
            } else {
                model.addAttribute("error", "Booking not found");
                return "redirect:/cashier/bookings";
            }
        } catch (Exception e) {
            model.addAttribute("error", "Error loading receipt: " + e.getMessage());
            return "redirect:/cashier/bookings";
        }
    }

    @GetMapping("/notifications")
    public String viewNotifications(Model model) {
        // Get all bookings
        List<Booking> allBookings = bookingService.getAllBookings();
        System.out.println("Total bookings found: " + allBookings.size());
        
        // Get all bookings that are RESERVED, ARRIVED or have users that are blocklisted
        List<Booking> bookings = allBookings.stream()
            .filter(booking -> {
                String bookingStatus = booking.getStatus().toString();
                boolean isReserved = "RESERVED".equals(bookingStatus);
                boolean isArrived = "ARRIVED".equals(bookingStatus);
                boolean isBlocklisted = booking.getUser() != null && booking.getUser().isBlocklisted();
                return isReserved || isArrived || isBlocklisted;
            })
            .toList();
        
        // Convert bookings to notifications
        List<Map<String, Object>> notifications = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        // Add system notifications (auto-blocked users)
        List<Notification> systemNotifications = notificationService.getSystemNotifications();
        for (Notification notification : systemNotifications) {
            if ("SYSTEM_BLOCKLIST".equals(notification.getType())) {
                Map<String, Object> notificationMap = new HashMap<>();
                notificationMap.put("type", "blocklist");
                notificationMap.put("title", notification.getTitle());
                notificationMap.put("message", notification.getMessage());
                notificationMap.put("icon", "fa-ban");
                notificationMap.put("time", notification.getCreatedAt());
                notificationMap.put("isPresent", false);
                notificationMap.put("minutesUntil", Long.MAX_VALUE);
                notificationMap.put("isArrived", false);
                notifications.add(notificationMap);
            }
        }
        
        for (Booking booking : bookings) {
            Map<String, Object> notification = new HashMap<>();
            String bookingStatus = booking.getStatus().toString();
            
            if ("RESERVED".equals(bookingStatus) || "ARRIVED".equals(bookingStatus)) {
                notification.put("type", "booking");
                notification.put("title", "ARRIVED".equals(bookingStatus) ? "User Arrived" : "Upcoming Booking");
                try {
                    // Calculate if this is a present booking (within 30 minutes before or after start time)
                    LocalDateTime bookingDateTime = LocalDateTime.of(booking.getDate(), booking.getStartTime());
                    boolean isPresent = now.isAfter(bookingDateTime.minusMinutes(30)) && 
                                     now.isBefore(bookingDateTime.plusMinutes(30));
                    
                    // Calculate time difference for display
                    long minutesUntil = java.time.Duration.between(now, bookingDateTime).toMinutes();
                    String timeStatus;
                    
                    if ("ARRIVED".equals(bookingStatus)) {
                        timeStatus = "User has arrived";
                    } else if (minutesUntil < 0) {
                        timeStatus = String.format("(Late by %d min)", Math.abs(minutesUntil));
                    } else if (minutesUntil < 60) {
                        timeStatus = String.format("(In %d min)", minutesUntil);
                    } else {
                        long hours = minutesUntil / 60;
                        long mins = minutesUntil % 60;
                        if (mins == 0) {
                            timeStatus = String.format("(In %d hr)", hours);
                        } else {
                            timeStatus = String.format("(In %d hr %d min)", hours, mins);
                        }
                    }
                    
                    notification.put("message", String.format(
                        "%s%s has %s slot %s at level %s for %s at %s %s. Vehicle: %s (%s %s)",
                        isPresent && "RESERVED".equals(bookingStatus) ? "⚠️ CURRENT BOOKING: " :
                        "ARRIVED".equals(bookingStatus) ? "🚗 ARRIVED: " : "",
                        booking.getUser().getFullName(),
                        "ARRIVED".equals(bookingStatus) ? "arrived at" : "booked",
                        booking.getSlotName(),
                        booking.getLevel(),
                        booking.getDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")),
                        booking.getStartTime().format(DateTimeFormatter.ofPattern("hh:mm a")),
                        timeStatus,
                        booking.getPlateNumber(),
                        booking.getUser().getVehicleModel(),
                        booking.getUser().getVehicleColor()
                    ));
                    notification.put("isPresent", isPresent || "ARRIVED".equals(bookingStatus));
                    notification.put("bookingTime", bookingDateTime);
                    notification.put("minutesUntil", "ARRIVED".equals(bookingStatus) ? -999 : minutesUntil);
                    notification.put("isArrived", "ARRIVED".equals(bookingStatus));
                } catch (Exception e) {
                    System.out.println("Error formatting booking notification: " + e.getMessage());
                    notification.put("message", "New booking received for slot " + booking.getSlotName());
                    notification.put("isPresent", false);
                    notification.put("minutesUntil", Long.MAX_VALUE);
                    notification.put("isArrived", false);
                }
                notification.put("icon", "ARRIVED".equals(bookingStatus) ? "fa-car" : "fa-car-side");
                notification.put("time", now);
                notifications.add(notification);
            }
            
            if (booking.getUser() != null && booking.getUser().isBlocklisted()) {
                notification = new HashMap<>();
                notification.put("type", "blocklist");
                notification.put("title", "Blocklisted User");
                try {
                    notification.put("message", String.format(
                        "User %s (Vehicle: %s) is blocklisted until %s for missing %d bookings. Contact: %s",
                        booking.getUser().getFullName(),
                        booking.getPlateNumber(),
                        booking.getUser().getBlocklistUntil().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")),
                        booking.getUser().getMissedBookingsCount(),
                        booking.getUser().getPhoneNumber()
                    ));
                } catch (Exception e) {
                    System.out.println("Error formatting blocklist notification: " + e.getMessage());
                    notification.put("message", "User " + booking.getUser().getFullName() + " has been blocklisted");
                }
                notification.put("icon", "fa-ban");
                notification.put("time", now);
                notification.put("isPresent", false);
                notification.put("minutesUntil", Long.MAX_VALUE);
                notification.put("isArrived", false);
                notifications.add(notification);
            }
        }
        
        // Sort notifications:
        // 1. System notifications (auto-blocked)
        // 2. New/Current bookings (RESERVED)
        // 3. Arrived users
        // 4. Blocklisted users
        notifications.sort((n1, n2) -> {
            boolean isPresent1 = (boolean) n1.getOrDefault("isPresent", false);
            boolean isPresent2 = (boolean) n2.getOrDefault("isPresent", false);
            boolean isArrived1 = (boolean) n1.getOrDefault("isArrived", false);
            boolean isArrived2 = (boolean) n2.getOrDefault("isArrived", false);
            String type1 = (String) n1.get("type");
            String type2 = (String) n2.get("type");
            
            // First sort by type: system > booking (RESERVED) > arrived > blocklist
            if ("blocklist".equals(type1) && !"blocklist".equals(type2)) return 1;
            if (!"blocklist".equals(type1) && "blocklist".equals(type2)) return -1;
            
            // For bookings, prioritize RESERVED over ARRIVED
            if ("booking".equals(type1) && "booking".equals(type2)) {
                // If one is arrived and other isn't
                if (isArrived1 && !isArrived2) return 1;
                if (!isArrived1 && isArrived2) return -1;
                
                // For RESERVED bookings, sort by time (closest first)
                if (!isArrived1 && !isArrived2) {
                    // Present bookings come first among RESERVED
                    if (isPresent1 && !isPresent2) return -1;
                    if (!isPresent1 && isPresent2) return 1;
                    
                    // Then sort by time until booking
                    long minutes1 = (long) n1.get("minutesUntil");
                    long minutes2 = (long) n2.get("minutesUntil");
                    return Long.compare(minutes1, minutes2);
                }
                
                // For ARRIVED bookings, sort by arrival time (most recent first)
                if (isArrived1 && isArrived2) {
                    return ((LocalDateTime)n2.get("time")).compareTo((LocalDateTime)n1.get("time"));
                }
            }
            
            // For blocklisted users, sort by time
            if ("blocklist".equals(type1) && "blocklist".equals(type2)) {
                return ((LocalDateTime)n2.get("time")).compareTo((LocalDateTime)n1.get("time"));
            }
            
            // Default to time-based sorting
            return ((LocalDateTime)n2.get("time")).compareTo((LocalDateTime)n1.get("time"));
        });
        
        model.addAttribute("notifications", notifications);
        return "cashier/notifications";
    }
}