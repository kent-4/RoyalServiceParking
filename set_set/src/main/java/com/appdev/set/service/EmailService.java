package com.appdev.set.service;

import com.appdev.set.model.User;
import com.appdev.set.model.Booking;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import java.util.logging.Logger;

@Service
public class EmailService {
    
    private static final Logger logger = Logger.getLogger(EmailService.class.getName());
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private TemplateEngine templateEngine;
    
    @Autowired
    private ParkingCostService parkingCostService;
    
    @Value("${frontend.public-url:}")
    private String frontendPublicUrl;

    @Value("${app.url:}")
    private String backendAppUrl;
    
    @PostConstruct
    public void init() {
        logger.info("Email auth links will use public URL: " + resolvePublicBaseUrl());
    }
    
    /**
     * Get the full public application URL for email links.
     * @param path the path to append to the base URL
     * @return the complete URL
     */
    private String getFullUrl(String path) {
        String publicBaseUrl = resolvePublicBaseUrl();
        if (publicBaseUrl == null || publicBaseUrl.isBlank()) {
            throw new IllegalStateException("frontend.public-url or app.url must be configured for email links.");
        }

        if (!path.isEmpty() && !path.startsWith("/")) {
            path = "/" + path;
        }

        String normalizedAppUrl = publicBaseUrl.endsWith("/")
                ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1)
                : publicBaseUrl;
        String fullUrl = normalizedAppUrl + path;
        logger.info("Generated URL: " + fullUrl);
        return fullUrl;
    }

    private String resolvePublicBaseUrl() {
        if (frontendPublicUrl != null && !frontendPublicUrl.isBlank()) {
            return frontendPublicUrl;
        }
        return backendAppUrl;
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
