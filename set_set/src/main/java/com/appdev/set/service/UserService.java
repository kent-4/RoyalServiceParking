package com.appdev.set.service;

import com.appdev.set.model.User;
import com.appdev.set.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import org.springframework.scheduling.annotation.Scheduled;
import com.appdev.set.repository.NotificationRepository;
import com.appdev.set.model.Booking;
import com.appdev.set.repository.BookingRepository;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Transactional
    public void deleteUnverifiedUser(String email) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User existing = existingUser.get();
            if (!existing.isVerified()) {
                try {
                    System.out.println("Found existing unverified user with email: " + existing.getEmail());
                    
                    // First delete all related notifications
                    System.out.println("Deleting notifications...");
                    notificationRepository.deleteByUser(existing);
                    
                    // Delete all related bookings
                    System.out.println("Deleting bookings...");
                    List<Booking> bookings = bookingRepository.findByUser(existing);
                    bookingRepository.deleteAll(bookings);
                    
                    // Then delete the user
                    System.out.println("Deleting user...");
                    userRepository.delete(existing);
                    
                    // Flush the changes to ensure they are committed
                    System.out.println("Flushing changes...");
                    userRepository.flush();
                    
                    System.out.println("Successfully deleted unverified user and related records");
                } catch (Exception e) {
                    System.err.println("Error while deleting unverified user: " + e.getMessage());
                    e.printStackTrace();
                    throw new RuntimeException("Error while deleting unverified user: " + e.getMessage());
                }
            }
        }
    }

    @Transactional
    public User registerUser(User user) {
        // Check if user already exists and delete if unverified
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            User existing = existingUser.get();
            if (!existing.isVerified()) {
                // Delete the existing unverified user in a separate transaction
                deleteUnverifiedUser(user.getEmail());
            } else {
                throw new RuntimeException("Email already in use");
            }
        }
        
        try {
            // Encode password
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            
            // Generate verification token
            String token = UUID.randomUUID().toString();
            user.setVerificationToken(token);
            user.setVerified(false);
            
            // Set default role
            user.setRole("USER");
            
            // Save user
            System.out.println("Saving new user with email: " + user.getEmail());
            User savedUser = userRepository.save(user);
            userRepository.flush(); // Ensure the save is committed
            
            // Send verification email
            System.out.println("Sending verification email...");
            emailService.sendVerificationEmail(user);
            
            System.out.println("User registration completed successfully");
            return savedUser;
        } catch (Exception e) {
            System.err.println("Error while creating new user: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error while creating new user: " + e.getMessage());
        }
    }
    
    @Transactional
    public boolean verifyUser(String token) {
        Optional<User> userOpt = userRepository.findByVerificationToken(token);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setVerified(true);
            user.setVerificationToken(null);
            userRepository.save(user);
            return true;
        }
        
        return false;
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
    
    public boolean isEmailVerified(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.isPresent() && userOpt.get().isVerified();
    }
    
    public boolean isValidResetToken(String token) {
        return userRepository.findByResetToken(token).isPresent();
    }
    
    public void initiatePasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Only proceed if the user is verified
            if (user.isVerified()) {
                String token = UUID.randomUUID().toString();
                user.setResetToken(token);
                userRepository.save(user);
                
                emailService.sendPasswordResetEmail(user);
            }
        }
    }
    
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findByResetToken(token);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetToken(null);
            userRepository.save(user);
            return true;
        }
        
        return false;
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public long countVerifiedUsers() {
        return userRepository.countByVerified(true);
    }
    
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    // New methods for blocklist functionality
    
    public List<User> getBlocklistedUsers() {
        List<User> blocklisted = userRepository.findByBlocklisted(true);
        System.out.println("DEBUG - Found " + blocklisted.size() + " blocklisted users");
        for (User user : blocklisted) {
            System.out.println("DEBUG - Blocklisted user: " + user.getEmail() + 
                             ", Until: " + user.getBlocklistUntil() + 
                             ", MissedCount: " + user.getMissedBookingsCount() +
                             ", IsCurrentlyBlocklisted: " + user.isCurrentlyBlocklisted());
        }
        return blocklisted.stream()
                         .filter(User::isCurrentlyBlocklisted)
                         .collect(Collectors.toList());
    }
    
    public void addUserToBlocklist(User user, boolean secondViolation) {
        System.out.println("DEBUG - Adding user to blocklist: " + user.getEmail());
        System.out.println("DEBUG - Current missed bookings: " + user.getMissedBookingsCount());
        
        user.setBlocklisted(true);
        user.setMissedBookingsCount(user.getMissedBookingsCount() + 1);
        
        // Set blocklist duration based on violation count
        LocalDateTime now = LocalDateTime.now();
        if (user.getMissedBookingsCount() == 1) {
            user.setBlocklistUntil(now.plusWeeks(3)); // 3 weeks for first offense
            System.out.println("DEBUG - First offense: Blocklisting for 3 weeks until " + user.getBlocklistUntil());
        } else {
            user.setBlocklistUntil(now.plusMonths(1)); // 1 month for subsequent offenses
            System.out.println("DEBUG - Subsequent offense: Blocklisting for 1 month until " + user.getBlocklistUntil());
        }
        
        userRepository.save(user);
        System.out.println("DEBUG - User successfully blocklisted: " + user.getEmail());
    }
    
    public void removeFromBlocklist(Long userId) {
        System.out.println("DEBUG - Attempting to remove user from blocklist: " + userId);
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("DEBUG - Found user: " + user.getEmail() + ", Current blocklist status: " + user.isBlocklisted());
            user.setBlocklisted(false);
            user.setBlocklistUntil(null);
            // Don't reset missedBookingsCount to maintain history
            userRepository.save(user);
            System.out.println("DEBUG - Successfully removed user from blocklist: " + user.getEmail());
        } else {
            System.out.println("DEBUG - User not found for ID: " + userId);
        }
    }
    
    // Check and update blocklist status for all users
    @Scheduled(fixedRate = 60000) // Run every minute
    public void updateBlocklistStatus() {
        System.out.println("DEBUG - Starting scheduled blocklist status update");
        List<User> blocklisted = userRepository.findByBlocklisted(true);
        System.out.println("DEBUG - Found " + blocklisted.size() + " users marked as blocklisted");
        LocalDateTime now = LocalDateTime.now();
        
        for (User user : blocklisted) {
            System.out.println("DEBUG - Checking user: " + user.getEmail() + 
                             ", BlocklistUntil: " + user.getBlocklistUntil() + 
                             ", CurrentTime: " + now);
            // Only update users with temporary blocks
            if (user.getBlocklistUntil() != null && now.isAfter(user.getBlocklistUntil())) {
                System.out.println("DEBUG - Removing expired blocklist for user: " + user.getEmail());
                user.setBlocklisted(false);
                user.setBlocklistUntil(null);
                userRepository.save(user);
                System.out.println("DEBUG - Successfully removed expired blocklist for: " + user.getEmail());
            }
        }
        System.out.println("DEBUG - Completed blocklist status update");
    }
}
