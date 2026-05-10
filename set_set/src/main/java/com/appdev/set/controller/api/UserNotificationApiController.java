package com.appdev.set.controller.api;

import com.appdev.set.controller.api.response.ApiErrorResponse;
import com.appdev.set.model.Notification;
import com.appdev.set.model.User;
import com.appdev.set.service.NotificationService;
import com.appdev.set.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
@RestController
@RequestMapping("/api/user/notifications")
public class UserNotificationApiController {

    private final NotificationService notificationService;
    private final UserService userService;

    public UserNotificationApiController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserNotificationsResponse> list(Authentication authentication) {
        User user = currentUser(authentication);
        List<NotificationListItemDto> notifications = notificationService.getUserNotifications(user).stream()
                .map(this::toListItem)
                .toList();

        long unreadCount = notifications.stream()
                .filter(item -> !item.read())
                .count();

        return ResponseEntity.ok(new UserNotificationsResponse(
                notifications,
                notifications.size(),
                unreadCount
        ));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> unreadCount(Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(new UnreadCountResponse(notificationService.getUnreadCount(user)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(Authentication authentication, @PathVariable Long id) {
        User user = currentUser(authentication);

        return notificationService.markAsReadForUser(user, id)
                .<ResponseEntity<?>>map(notification -> ResponseEntity.ok(new NotificationMutationResponse(
                        "Notification marked as read.",
                        toListItem(notification),
                        notificationService.getUnreadCount(user)
                )))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        ApiErrorResponse.of("Notification not found for this user.")
                ));
    }

    @PostMapping("/read-all")
    public ResponseEntity<MarkAllReadResponse> markAllAsRead(Authentication authentication) {
        User user = currentUser(authentication);
        int updatedCount = notificationService.markAllAsReadForUser(user);
        return ResponseEntity.ok(new MarkAllReadResponse(
                "All notifications marked as read.",
                updatedCount,
                notificationService.getUnreadCount(user)
        ));
    }

    private User currentUser(Authentication authentication) {
        return userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private NotificationListItemDto toListItem(Notification notification) {
        return new NotificationListItemDto(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : null,
                notification.isRead()
        );
    }

    public record UserNotificationsResponse(
            List<NotificationListItemDto> notifications,
            int totalCount,
            long unreadCount
    ) {
    }

    public record NotificationListItemDto(
            Long id,
            String type,
            String title,
            String message,
            String createdAt,
            boolean read
    ) {
    }

    public record UnreadCountResponse(long count) {
    }

    public record NotificationMutationResponse(
            String message,
            NotificationListItemDto notification,
            long unreadCount
    ) {
    }

    public record MarkAllReadResponse(
            String message,
            int updatedCount,
            long unreadCount
    ) {
    }
}
