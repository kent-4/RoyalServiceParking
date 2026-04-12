package com.appdev.set.service;

import com.appdev.set.model.User;
import com.appdev.set.model.Booking;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.springframework.beans.factory.annotation.Value;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;
import org.springframework.core.env.Environment;
import java.util.logging.Logger;
import java.util.logging.Level;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;

@Service
public class EmailService {
    
    private static final Logger logger = Logger.getLogger(EmailService.class.getName());
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private TemplateEngine templateEngine;
    
    @Autowired
    private ParkingCostService parkingCostService;

    @Autowired
    private Environment environment;
    
    @Value("${app.url}")
    private String configuredAppUrl;
    
    @Value("${server.port:8080}")
    private String serverPort;
    
    @Value("${server.servlet.context-path:}")
    private String configuredContextPath;
    
    private String dynamicAppUrl;
    private String warContextPath = "/royal-service-parking";  // Default WAR context path
    
    @PostConstruct
    public void init() {
        // Try to determine the dynamic IP address on startup
        updateDynamicAppUrl();
        logger.info("Dynamic application URL initialized to: " + dynamicAppUrl);
        logger.info("Using WAR context path: " + warContextPath);
    }
    
    /**
     * Updates the dynamic application URL based on the server's IP address
     */
    private void updateDynamicAppUrl() {
        try {
            String ip = getServerIpAddress();
            if (ip != null) {
                dynamicAppUrl = "http://" + ip + ":" + serverPort;
                logger.info("Dynamic URL updated to: " + dynamicAppUrl);
            } else {
                // Fall back to configured URL if IP detection fails
                dynamicAppUrl = configuredAppUrl;
                logger.warning("Could not detect server IP. Using configured URL: " + dynamicAppUrl);
            }
        } catch (Exception e) {
            logger.log(Level.WARNING, "Error detecting server IP. Using configured URL: " + configuredAppUrl, e);
            dynamicAppUrl = configuredAppUrl;
        }
    }
    
    /**
     * Detect the server's IP address
     * @return The server's IP address or null if it cannot be determined
     */
    private String getServerIpAddress() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                // Skip loopback, inactive, and virtual interfaces
                if (iface.isLoopback() || !iface.isUp() || iface.isVirtual()) {
                    continue;
                }
                
                Enumeration<InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    String hostAddress = addr.getHostAddress();
                    // Skip IPv6 addresses and loopback
                    if (!hostAddress.contains(":") && !addr.isLoopbackAddress()) {
                        logger.info("Detected server IP: " + hostAddress);
                        return hostAddress;
                    }
                }
            }
        } catch (SocketException e) {
            logger.log(Level.WARNING, "Error getting network interfaces", e);
        }
        return null;
    }
    
    /**
     * Get the full application URL including context path
     * @param path the path to append to the base URL
     * @return the complete URL
     */
    private String getFullUrl(String path) {
        // Check if we need to refresh the dynamic URL (in case IP has changed)
        updateDynamicAppUrl();
        
        // Ensure path starts with a slash if not empty
        if (!path.isEmpty() && !path.startsWith("/")) {
            path = "/" + path;
        }
        
        // Always include WAR context path when deployed as WAR
        String contextPathToUse = warContextPath;
        
        // Normalize the context path
        if (contextPathToUse != null && !contextPathToUse.isEmpty()) {
            // Make sure contextPath doesn't start with slash as appUrl might already end with one
            if (contextPathToUse.startsWith("/")) {
                contextPathToUse = contextPathToUse.substring(1);
            }
            
            // Make sure appUrl ends with slash before appending
            String normalizedAppUrl = dynamicAppUrl.endsWith("/") ? dynamicAppUrl : dynamicAppUrl + "/";
            String fullUrl = normalizedAppUrl + contextPathToUse + path;
            
            logger.info("Generated URL: " + fullUrl);
            return fullUrl;
        } else {
            // If no context path, just combine appUrl and path
            String fullUrl = dynamicAppUrl + path;
            logger.info("Generated URL (no context path): " + fullUrl);
            return fullUrl;
        }
    }
    
    public void sendVerificationEmail(User user) {
        try {
            Context context = new Context();
            context.setVariable("user", user);
            String verificationUrl = getFullUrl("/verify?token=" + user.getVerificationToken());
            context.setVariable("verificationUrl", verificationUrl);
            context.setVariable("headerText", "Email Verification");
            
            System.out.println("Attempting to send verification email to: " + user.getEmail());
            System.out.println("Verification URL: " + verificationUrl);
            
            String emailContent = templateEngine.process("email/verification", context);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(user.getEmail());
            helper.setSubject("Royal Service Parking - Verify Your Email");
            helper.setText(emailContent, true);
            
            System.out.println("Email content generated, attempting to send...");
            mailSender.send(message);
            System.out.println("Verification email sent successfully!");
        } catch (MessagingException e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send verification email", e);
        }
    }
    
    public void sendPasswordResetEmail(User user) {
        try {
            Context context = new Context();
            context.setVariable("user", user);
            context.setVariable("resetUrl", getFullUrl("/reset-password?token=" + user.getResetToken()));
            context.setVariable("headerText", "Password Reset Request");
            
            String emailContent = templateEngine.process("email/reset-password", context);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(user.getEmail());
            helper.setSubject("Royal Service Parking - Password Reset");
            helper.setText(emailContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
    
    public void sendNotificationEmail(User user, String message) {
        try {
            Context context = new Context();
            context.setVariable("user", user);
            context.setVariable("notificationMessage", message);
            context.setVariable("headerText", "Important Notification");
            
            String emailContent = templateEngine.process("email/notification", context);
            
            MimeMessage emailMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(emailMessage, true);
            
            helper.setTo(user.getEmail());
            helper.setSubject("Royal Service Parking - Notification");
            helper.setText(emailContent, true);
            
            mailSender.send(emailMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send notification email", e);
        }
    }
    
    public void sendBookingConfirmationEmail(Booking booking) {
        try {
            System.out.println("Starting to prepare booking confirmation email...");
            
            Context context = new Context();
            context.setVariable("booking", booking);
            context.setVariable("headerText", "Booking Confirmation");
            context.setVariable("parkingCost", parkingCostService.getCurrentRate());
            
            System.out.println("Processing email template...");
            String emailContent = templateEngine.process("email/booking-notification", context);
            System.out.println("Email template processed successfully");
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            String recipientEmail = booking.getUser().getEmail();
            System.out.println("Setting email recipient to: " + recipientEmail);
            helper.setTo(recipientEmail);
            helper.setSubject("Royal Service Parking - Booking Confirmation");
            helper.setText(emailContent, true);
            
            System.out.println("Attempting to send email...");
            mailSender.send(message);
            System.out.println("Booking confirmation email sent successfully to: " + recipientEmail);
        } catch (MessagingException e) {
            System.err.println("Failed to send booking confirmation email: " + e.getMessage());
            System.err.println("Error details:");
            e.printStackTrace();
            throw new RuntimeException("Failed to send booking confirmation email", e);
        } catch (Exception e) {
            System.err.println("Unexpected error sending booking confirmation: " + e.getMessage());
            System.err.println("Error details:");
            e.printStackTrace();
            throw new RuntimeException("Failed to send booking confirmation email", e);
        }
    }
    
    public void sendBookingCompletedEmail(Booking booking) {
        try {
            Context context = new Context();
            context.setVariable("booking", booking);
            context.setVariable("headerText", "Booking Completed");
            
            // Calculate parking duration
            long totalHours = booking.getParkingHours();
            long days = totalHours / 24;
            long remainingHours = totalHours % 24;
            
            context.setVariable("parkingDays", days);
            context.setVariable("parkingHours", remainingHours);
            context.setVariable("parkingCost", parkingCostService.getCurrentRate());
            
            String emailContent = templateEngine.process("email/booking-completed", context);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(booking.getUser().getEmail());
            helper.setSubject("Royal Service Parking - Booking Completed");
            helper.setText(emailContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send booking completed email", e);
        }
    }

    public void sendBlocklistNotification(User user, String blocklistMessage) throws MessagingException {
        Context context = new Context();
        context.setVariable("user", user);
        context.setVariable("blocklistMessage", blocklistMessage);
        context.setVariable("headerText", "Account Blocklisted");
        context.setVariable("blocklistUntil", user.getBlocklistUntil().toLocalDate());
        
        String emailContent = templateEngine.process("email/blocklist-notification", context);
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        
        helper.setTo(user.getEmail());
        helper.setSubject("Royal Service Parking - Account Blocklisted");
        helper.setText(emailContent, true);
        
        mailSender.send(message);
    }
}
