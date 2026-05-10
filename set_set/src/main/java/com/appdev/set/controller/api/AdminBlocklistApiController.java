package com.appdev.set.controller.api;

import com.appdev.set.controller.api.response.ApiErrorResponse;
import com.appdev.set.model.User;
import com.appdev.set.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
@RestController
@RequestMapping("/api/admin/blocklist")
public class AdminBlocklistApiController {

    private final UserService userService;

    public AdminBlocklistApiController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<AdminBlocklistResponse> blocklist() {
        LocalDateTime now = LocalDateTime.now();
        List<User> blocklistedUsers = userService.getBlocklistedUsers();

        long expiringSoonCount = blocklistedUsers.stream()
                .filter(user -> user.getBlocklistUntil() != null)
                .filter(user -> {
                    long days = Duration.between(now, user.getBlocklistUntil()).toDays();
                    return days >= 0 && days <= 7;
                })
                .count();

        int totalMissedBookings = blocklistedUsers.stream()
                .mapToInt(User::getMissedBookingsCount)
                .sum();

        List<AdminBlocklistUserDto> users = blocklistedUsers.stream()
                .map(this::toDto)
                .toList();

        return ResponseEntity.ok(new AdminBlocklistResponse(
                users,
                users.size(),
                expiringSoonCount,
                totalMissedBookings
        ));
    }

    @PostMapping("/{id}/remove")
    public ResponseEntity<?> remove(@PathVariable Long id) {
        return userService.findById(id)
                .filter(User::isCurrentlyBlocklisted)
                .<ResponseEntity<?>>map(user -> {
                    userService.removeFromBlocklist(id);
                    return ResponseEntity.ok(new BlocklistMutationResponse(
                            "User removed from blocklist.",
                            user.getId()
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiErrorResponse.of("Active blocklisted user not found.")));
    }

    private AdminBlocklistUserDto toDto(User user) {
        return new AdminBlocklistUserDto(
                user.getId(),
                safe(user.getFullName()),
                safe(user.getEmail()),
                safe(user.getPhoneNumber()),
                safe(user.getPlateNumber()),
                user.getMissedBookingsCount(),
                user.getBlocklistUntil() != null ? user.getBlocklistUntil().toString() : null,
                user.getBlocklistUntil() == null
        );
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "Not provided" : value;
    }

    public record AdminBlocklistResponse(
            List<AdminBlocklistUserDto> users,
            int totalResults,
            long expiringSoonCount,
            int totalMissedBookings
    ) {
    }

    public record AdminBlocklistUserDto(
            Long id,
            String fullName,
            String email,
            String phoneNumber,
            String plateNumber,
            int missedBookingsCount,
            String blocklistUntil,
            boolean isPermanent
    ) {
    }

    public record BlocklistMutationResponse(String message, Long userId) {
    }
}
