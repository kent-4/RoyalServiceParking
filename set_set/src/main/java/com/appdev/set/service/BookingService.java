package com.appdev.set.service;

import com.appdev.set.model.Booking;
import com.appdev.set.model.ParkingSlot;
import com.appdev.set.model.User;
import com.appdev.set.model.Notification;
import com.appdev.set.repository.BookingRepository;
import com.appdev.set.repository.ParkingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.time.format.DateTimeFormatter;
import java.time.Duration;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private ParkingSlotRepository parkingSlotRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ParkingCostService parkingCostService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private EmailService emailService;
    
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");
    
    @Transactional
    public Booking createBooking(Booking booking) {
        // Validate booking object
        if (booking == null) {
            throw new IllegalArgumentException("Booking cannot be null");
        }
        
        if (booking.getUser() == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        
        if (booking.getDate() == null) {
            throw new IllegalArgumentException("Booking date cannot be null");
        }
        
        if (booking.getStartTime() == null) {
            throw new IllegalArgumentException("Start time cannot be null");
        }
        
        if (booking.getExitTime() == null) {
            throw new IllegalArgumentException("Exit time cannot be null");
        }
        
        if (booking.getLevel() == null || booking.getLevel().isEmpty()) {
            throw new IllegalArgumentException("Parking level cannot be null or empty");
        }
        
        if (booking.getSlotName() == null || booking.getSlotName().isEmpty()) {
            throw new IllegalArgumentException("Slot name cannot be null or empty");
        }
        
        // Check if user is blocklisted
        User user = booking.getUser();
        if (user.isCurrentlyBlocklisted()) {
            throw new RuntimeException("You are currently blocklisted and cannot make new bookings until " + 
                                      user.getBlocklistUntil().toLocalDate());
        }
        
        // Check if user has any active bookings (RESERVED or ARRIVED)
        List<String> activeStatuses = List.of("RESERVED", "ARRIVED");
        List<Booking> activeUserBookings = bookingRepository.findByUserAndStatusIn(user, activeStatuses);
        
        if (!activeUserBookings.isEmpty()) {
            Booking activeBooking = activeUserBookings.get(0);
            throw new RuntimeException("You already have an active booking for slot " + 
                activeBooking.getSlotName() + " at level " + activeBooking.getLevel() + 
                " on " + activeBooking.getDate() + " at " + activeBooking.getStartTime());
        }
        
        // Store the original date and time to ensure they don't change
        LocalDate originalDate = booking.getDate();
        LocalTime originalTime = booking.getStartTime();
        
        System.out.println("DEBUG - Creating booking for date: " + originalDate + " and time: " + originalTime);
        
        // Check if slot has any active bookings (RESERVED or ARRIVED)
        List<Booking> activeSlotBookings = findActiveBookingsBySlot(
            booking.getLevel(), 
            booking.getSlotName(),
            activeStatuses
        );
        
        if (!activeSlotBookings.isEmpty()) {
            throw new RuntimeException("This slot is currently booked and unavailable until the current booking is completed");
        }
        
        // Set booking status to RESERVED
        booking.setStatus(Booking.BookingStatus.RESERVED);
        
        // Mark the slot as unavailable
        ParkingSlot slot = parkingSlotRepository.findByLevelAndSlotName(
            booking.getLevel(), booking.getSlotName()
        );
        
        if (slot != null) {
            System.out.println("DEBUG - Marking slot as unavailable: " + booking.getLevel() + " - " + booking.getSlotName());
            slot.setAvailable(false);
            parkingSlotRepository.save(slot);
        } else {
            System.err.println("ERROR - Could not find slot: " + booking.getLevel() + " - " + booking.getSlotName());
            throw new RuntimeException("Parking slot not found: " + booking.getLevel() + " - " + booking.getSlotName());
        }
        
        // Save the booking
        Booking savedBooking = bookingRepository.save(booking);
        
        // Send booking confirmation notification
        String confirmationMessage = String.format(
            "Your booking for %s on %s at %s has been confirmed. Please arrive within 1 hour to avoid cancellation.",
            booking.getSlotName(),
            booking.getDate().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")),
            booking.getStartTime().format(TIME_FORMATTER)
        );
        notificationService.createNotification(
            user,
            Notification.NotificationType.BOOKING_CONFIRMATION.toString(),
            "Booking Confirmation",
            confirmationMessage
        );
        
        // Send booking confirmation email
        try {
            System.out.println("Preparing to send booking confirmation email...");
            System.out.println("User email: " + user.getEmail());
            System.out.println("Booking details: " + 
                             "ID=" + savedBooking.getId() + 
                             ", Slot=" + savedBooking.getSlotName() + 
                             ", Level=" + savedBooking.getLevel() + 
                             ", Date=" + savedBooking.getDate() + 
                             ", Time=" + savedBooking.getStartTime());
            
            // Set parking cost for the email template
            savedBooking.setParkingCost(parkingCostService.getCurrentRate().getHourlyRate());
            
            emailService.sendBookingConfirmationEmail(savedBooking);
            System.out.println("Booking confirmation email sent successfully!");
        } catch (Exception e) {
            System.err.println("Failed to send booking confirmation email: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Send completion notification if status is COMPLETED
        if (Booking.BookingStatus.COMPLETED == booking.getStatus()) {
            String completeMessage = String.format(
                "Thank you for choosing Royal Service Parking. Your parking session for %s has been successfully completed. We look forward to serving you again!",
                booking.getSlotName()
            );
            notificationService.createNotification(
                booking.getUser(),
                Notification.NotificationType.COMPLETED.toString(),
                "Booking Completed",
                completeMessage
            );
        }
        
        return savedBooking;
    }
    
    // Helper method to find active bookings by slot
    private List<Booking> findActiveBookingsBySlot(String level, String slotName, List<String> statuses) {
        try {
            return bookingRepository.findByLevelAndSlotNameAndStatusIn(level, slotName, statuses);
        } catch (Exception e) {
            System.err.println("ERROR - Failed to find active bookings by slot: " + e.getMessage());
            e.printStackTrace();
            // Fallback to a more basic query if the repository method fails
            List<Booking> allActiveBookings = bookingRepository.findByStatusIn(statuses);
            return allActiveBookings.stream()
                .filter(b -> b.getLevel().equals(level) && b.getSlotName().equals(slotName))
                .toList();
        }
    }
    
    public List<Booking> getUserBookings(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        return bookingRepository.findByUser(user);
    }
    
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    public Optional<Booking> getBookingById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Booking ID cannot be null");
        }
        return bookingRepository.findById(id);
    }
    
    // Updated to make slots available again when a booking is completed
    @Transactional
    public Booking updateBookingStatus(Long id, Booking.BookingStatus status) {
        if (id == null) {
            throw new IllegalArgumentException("Booking ID cannot be null");
        }
        
        if (status == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
        
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            // If marking as COMPLETED, set exit time and calculate cost
            if (status == Booking.BookingStatus.COMPLETED) {
                LocalDateTime now = LocalDateTime.now();
                LocalTime exitTime = now.toLocalTime();
                booking.setExitTime(exitTime);
                
                // Create LocalDateTime for start using booking date and time
                LocalDateTime startDateTime = LocalDateTime.of(booking.getDate(), booking.getStartTime());
                LocalDateTime exitDateTime = LocalDateTime.of(
                    now.toLocalDate(),
                    exitTime
                );
                
                // If exit time is before start time, it means we crossed midnight
                if (exitDateTime.isBefore(startDateTime)) {
                    exitDateTime = exitDateTime.plusDays(1);
                }
                
                // Calculate duration in minutes
                long minutesBetween = Duration.between(startDateTime, exitDateTime).toMinutes();
                
                // Calculate hours, always rounding up partial hours
                long hours = (minutesBetween + 59) / 60; // Round up
                
                // Minimum 1 hour charge
                if (hours < 1) {
                    hours = 1;
                }
                
                double hourlyRate = parkingCostService.getCurrentRate().getHourlyRate();
                booking.setParkingHours((int) hours);
                booking.setParkingCost(hours * hourlyRate);
            }
            booking.setStatus(status);
            
            // Get the slot
            ParkingSlot slot = parkingSlotRepository.findByLevelAndSlotName(
                booking.getLevel(), booking.getSlotName()
            );
            
            if (slot != null) {
                // If status is RESERVED or ARRIVED, mark slot as unavailable
                if (status == Booking.BookingStatus.RESERVED || status == Booking.BookingStatus.ARRIVED) {
                    System.out.println("DEBUG - Marking slot as unavailable due to status change to " + status);
                    slot.setAvailable(false);
                    parkingSlotRepository.save(slot);
                } 
                // Make the slot available again ONLY when booking is COMPLETED or CANCELED
                else if (status == Booking.BookingStatus.COMPLETED || status == Booking.BookingStatus.CANCELED) {
                    System.out.println("DEBUG - Marking slot as available due to status change to " + status);
                    slot.setAvailable(true);
                    parkingSlotRepository.save(slot);
                }
            } else {
                System.err.println("ERROR - Could not find slot: " + booking.getLevel() + " - " + booking.getSlotName());
            }
            
            Booking savedBooking = bookingRepository.save(booking);
            // Debug log
            System.out.println("DEBUG: Booking updated - ID: " + savedBooking.getId() + ", Status: " + savedBooking.getStatus() + ", Exit Time: " + savedBooking.getExitTime());

            // Send completion notification and email if status is COMPLETED
            if (status == Booking.BookingStatus.COMPLETED) {
                String completeMessage = String.format(
                    "Thank you for choosing Royal Service Parking. Your parking session for %s has been successfully completed. We look forward to serving you again!",
                    booking.getSlotName()
                );
                notificationService.createNotification(
                    booking.getUser(),
                    Notification.NotificationType.COMPLETED.toString(),
                    "Booking Completed",
                    completeMessage
                );
                
                // Send completion email
                emailService.sendBookingCompletedEmail(savedBooking);
            }
            return savedBooking;
        }
        
        throw new RuntimeException("Booking not found");
    }
    
    public long countReservedBookings() {
        return bookingRepository.countByStatus("RESERVED");
    }

    public List<Booking> getReservedBookingsByLevelAndDate(String level, LocalDate date) {
        if (level == null || level.isEmpty()) {
            throw new IllegalArgumentException("Level cannot be null or empty");
        }
        
        if (date == null) {
            throw new IllegalArgumentException("Date cannot be null");
        }
        
        System.out.println("DEBUG - Getting reserved bookings for level: " + level + " and date: " + date);
        
        List<Booking> reservedBookings = bookingRepository.findByLevelAndDateAndStatus(level, date, "RESERVED");
        List<Booking> arrivedBookings = bookingRepository.findByLevelAndDateAndStatus(level, date, "ARRIVED");
        
        System.out.println("DEBUG - Found " + reservedBookings.size() + " RESERVED bookings");
        System.out.println("DEBUG - Found " + arrivedBookings.size() + " ARRIVED bookings");
        
        // Only include RESERVED and ARRIVED bookings, not COMPLETED or CANCELED ones
        List<Booking> allBookings = new ArrayList<>(reservedBookings);
        allBookings.addAll(arrivedBookings);
        
        // Log the bookings for debugging
        for (Booking booking : allBookings) {
            System.out.println("DEBUG - Active booking: Level=" + booking.getLevel() + 
                              ", Slot=" + booking.getSlotName() + 
                              ", Date=" + booking.getDate() + 
                              ", Time=" + booking.getStartTime() + 
                              ", Status=" + booking.getStatus());
        }
        
        return allBookings;
    }
    
    @Transactional
    public Booking markUserArrived(Long bookingId) {
        if (bookingId == null) {
            throw new IllegalArgumentException("Booking ID cannot be null");
        }
        
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            booking.setArrived(true);
            booking.setArrivalTime(LocalDateTime.now());
            booking.setStatus(Booking.BookingStatus.ARRIVED);
            // Set the current system time as the start time
            booking.setStartTime(java.time.LocalTime.now());
            // Ensure the slot remains unavailable
            ParkingSlot slot = parkingSlotRepository.findByLevelAndSlotName(
                booking.getLevel(), booking.getSlotName()
            );
            if (slot != null) {
                slot.setAvailable(false);
                parkingSlotRepository.save(slot);
            }
            return bookingRepository.save(booking);
        }
        
        throw new RuntimeException("Booking not found");
    }
    
    // FIXED: Only blocklist users who actually miss their 1-hour arrival window
    @Transactional
    @Scheduled(fixedRate = 60000) // Run every minute
    public void checkAndExpireBookings() {
        LocalDateTime now = LocalDateTime.now();
        
        System.out.println("DEBUG - Checking for expired bookings at " + now);
        
        // Find only RESERVED bookings
        List<Booking> reservedBookings = bookingRepository.findByStatus("RESERVED");
        
        System.out.println("DEBUG - Found " + reservedBookings.size() + " RESERVED bookings to check");
        
        for (Booking booking : reservedBookings) {
            // Calculate the deadline (booking date + start time + 1 hour)
            LocalDateTime bookingDateTime = LocalDateTime.of(booking.getDate(), booking.getStartTime());
            LocalDateTime deadline = bookingDateTime.plusHours(1);
            
            System.out.println("DEBUG - Checking booking ID=" + booking.getId() + 
                             ", DateTime=" + bookingDateTime + 
                             ", Deadline=" + deadline + 
                             ", Now=" + now + 
                             ", IsExpired=" + now.isAfter(deadline) + 
                             ", AutoExpired=" + booking.isAutoExpired() + 
                             ", Arrived=" + booking.isArrived());
            
            // Only process if the deadline has passed and user hasn't arrived
            if (now.isAfter(deadline) && !booking.isAutoExpired() && !booking.isArrived()) {
                System.out.println("DEBUG - Processing expired booking: " + booking.getId());
                
                // Mark booking as auto-expired and canceled
                booking.setAutoExpired(true);
                booking.setStatus(Booking.BookingStatus.CANCELED);
                
                // Update parking slot availability
                ParkingSlot slot = parkingSlotRepository.findByLevelAndSlotName(booking.getLevel(), booking.getSlotName());
                if (slot != null) {
                    System.out.println("DEBUG - Marking slot as available due to no-show: " + slot.getLevel() + " - " + slot.getSlotName());
                    slot.setAvailable(true);
                    parkingSlotRepository.save(slot);
                }
                
                // Update user's no-show count and blocklist them
                User user = booking.getUser();
                if (user != null) {
                    System.out.println("DEBUG - Processing user for blocklisting: " + user.getEmail());
                    System.out.println("DEBUG - Current missed bookings count: " + user.getMissedBookingsCount());
                    
                    user.setMissedBookingsCount(user.getMissedBookingsCount() + 1);
                    user.setBlocklisted(true);
                    
                    // Set blocklist duration based on number of missed bookings
                    LocalDateTime blocklistUntil;
                    if (user.getMissedBookingsCount() == 1) {
                        blocklistUntil = now.plusWeeks(3); // 3 weeks for first offense
                    } else {
                        blocklistUntil = now.plusMonths(1); // 1 month for subsequent offenses
                    }
                    user.setBlocklistUntil(blocklistUntil);
                    userService.updateUser(user);
                    
                    System.out.println("DEBUG - Updated user blocklist status: " + 
                                     "MissedCount=" + user.getMissedBookingsCount() + 
                                     ", BlocklistedUntil=" + user.getBlocklistUntil());
                    
                    // Send blocklist notification to the user
                    String blocklistMessage = String.format(
                        "Your account has been blocklisted until %s due to missing your booking. This is your %d%s missed booking.",
                        blocklistUntil.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")),
                        user.getMissedBookingsCount(),
                        user.getMissedBookingsCount() == 1 ? "st" : (user.getMissedBookingsCount() == 2 ? "nd" : (user.getMissedBookingsCount() == 3 ? "rd" : "th"))
                    );
                    
                    notificationService.createNotification(
                        user,
                        Notification.NotificationType.BLOCKLIST.name(),
                        "Account Blocklisted",
                        blocklistMessage
                    );
                    
                    // Send email notification
                    try {
                        emailService.sendBlocklistNotification(user, blocklistMessage);
                    } catch (Exception e) {
                        System.err.println("Failed to send blocklist email: " + e.getMessage());
                    }
                }
                
                // Create system notification for cashiers
                String systemMessage = String.format(
                    "Booking #%d auto-expired. User %s did not arrive within 1 hour of scheduled time %s. Slot %s-%s is now available. User has been blocklisted until %s.",
                    booking.getId(),
                    user != null ? user.getFullName() : "Unknown",
                    booking.getStartTime().format(DateTimeFormatter.ofPattern("hh:mm a")),
                    booking.getLevel(),
                    booking.getSlotName(),
                    user != null ? user.getBlocklistUntil().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) : "N/A"
                );
                
                notificationService.createSystemNotification(
                    Notification.NotificationType.SYSTEM_BLOCKLIST.name(),
                    "Booking Auto-Expired",
                    systemMessage
                );
                
                bookingRepository.save(booking);
                System.out.println("DEBUG - Successfully processed expired booking #" + booking.getId());
            }
        }
    }
    
    @Transactional
    public Booking updateBookingTimes(Long bookingId, LocalTime newStartTime, LocalTime newExitTime) {
        if (bookingId == null) {
            throw new IllegalArgumentException("Booking ID cannot be null");
        }
        
        if (newStartTime == null) {
            throw new IllegalArgumentException("Start time cannot be null");
        }
        
        if (newExitTime == null) {
            throw new IllegalArgumentException("Exit time cannot be null");
        }
        
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            booking.setStartTime(newStartTime);
            booking.setExitTime(newExitTime);
            
            // Create LocalDateTime objects for calculation
            LocalDateTime startDateTime = LocalDateTime.of(booking.getDate(), newStartTime);
            LocalDateTime exitDateTime = LocalDateTime.of(booking.getDate(), newExitTime);
            
            // If exit time is before start time, it means we crossed midnight
            if (exitDateTime.isBefore(startDateTime)) {
                exitDateTime = exitDateTime.plusDays(1);
            }
            
            // Calculate duration in minutes
            long minutesBetween = Duration.between(startDateTime, exitDateTime).toMinutes();
            
            // Calculate hours, always rounding up partial hours
            long hours = (minutesBetween + 59) / 60; // Round up
            
            // Ensure at least 1 hour
            if (hours < 1) {
                hours = 1;
            }
            
            booking.setParkingHours((int) hours);
            // Recalculate cost based on hourly rate
            double hourlyRate = parkingCostService.getCurrentRate().getHourlyRate();
            booking.setParkingCost(hours * hourlyRate);
            return bookingRepository.save(booking);
        }
        
        throw new RuntimeException("Booking not found");
    }
    
    @Scheduled(fixedRate = 60000) // Run every minute
    public void checkAndSendReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        LocalTime currentTime = now.toLocalTime();
        
        // Find all reserved bookings that are starting in 30 minutes
        List<Booking> upcomingBookings = bookingRepository.findByStatusAndDateAndStartTimeBefore(
            "RESERVED", today, currentTime.plusMinutes(30));
        
        for (Booking booking : upcomingBookings) {
            // Check if we haven't already sent a reminder
            if (!booking.isReminderSent()) {
                String reminderMessage = String.format(
                    "Reminder: You must arrive by %s. No-show after %s results in cancellation.",
                    booking.getStartTime().format(TIME_FORMATTER),
                    booking.getStartTime().plusHours(1).format(TIME_FORMATTER)
                );
                
                notificationService.createNotification(
                    booking.getUser(),
                    Notification.NotificationType.BOOKING_REMINDER.toString(),
                    "Booking Reminder",
                    reminderMessage
                );
                
                booking.setReminderSent(true);
                bookingRepository.save(booking);
            }
        }
    }

    public long countParkedBookings() {
        return bookingRepository.countByStatus("ARRIVED");
    }
}
