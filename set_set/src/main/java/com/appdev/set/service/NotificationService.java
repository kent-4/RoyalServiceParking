package com.appdev.set.service;

import com.appdev.set.model.Notification;
import com.appdev.set.model.User;
import com.appdev.set.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Transactional
    public Notification createNotification(User user, String type, String title, String message) {
        Notification notification = new Notification();
        notification.setUser(user); // Can be null for system notifications
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        return notificationRepository.save(notification);
    }
    
    @Transactional
    public Notification createSystemNotification(String type, String title, String message) {
        // Create notification without a user (for system-wide notifications)
        return createNotification(null, type, title, message);
    }
    
    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }
    
    public List<Notification> getSystemNotifications() {
        return notificationRepository.findByUserIsNullOrderByCreatedAtDesc();
    }
    
    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public List<Notification> getAllNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public Optional<Notification> getUserNotificationById(User user, Long notificationId) {
        return notificationRepository.findByIdAndUser(notificationId, user);
    }
    
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public Optional<Notification> markAsReadForUser(User user, Long notificationId) {
        return notificationRepository.findByIdAndUser(notificationId, user).map(notification -> {
            notification.setRead(true);
            return notificationRepository.save(notification);
        });
    }
    
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public int markAllAsReadForUser(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
        return unreadNotifications.size();
    }
    
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    
    @Transactional
    public void deleteAllForUser(User user) {
        notificationRepository.deleteByUser(user);
    }
} 
