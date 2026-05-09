package com.appdev.set.controller.api;

import com.appdev.set.model.User;
import com.appdev.set.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileApiController {

    private final UserService userService;

    public ProfileApiController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> currentProfile(Authentication authentication) {
        return ResponseEntity.ok(toProfileResponse(currentUser(authentication)));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();

        if (isBlank(request.fullName())) {
            fieldErrors.put("fullName", "Full name is required.");
        }
        if (isBlank(request.phoneNumber())) {
            fieldErrors.put("phoneNumber", "Phone number is required.");
        }
        if (isBlank(request.plateNumber())) {
            fieldErrors.put("plateNumber", "Plate number is required.");
        }
        if (isBlank(request.vehicleType())) {
            fieldErrors.put("vehicleType", "Vehicle type is required.");
        }
        if (isBlank(request.vehicleModel())) {
            fieldErrors.put("vehicleModel", "Vehicle model is required.");
        }
        if (isBlank(request.vehicleColor())) {
            fieldErrors.put("vehicleColor", "Vehicle color is required.");
        }

        if (!fieldErrors.isEmpty()) {
          return ResponseEntity.badRequest().body(new ValidationErrorResponse(
                  "Review the profile form and try again.",
                  fieldErrors
          ));
        }

        User user = currentUser(authentication);
        user.setFullName(request.fullName().trim());
        user.setPhoneNumber(request.phoneNumber().trim());
        user.setAddress(trimToNull(request.address()));
        user.setPlateNumber(request.plateNumber().trim());
        user.setVehicleType(request.vehicleType().trim());
        user.setVehicleModel(request.vehicleModel().trim());
        user.setVehicleColor(request.vehicleColor().trim());

        User updated = userService.updateUser(user);
        return ResponseEntity.ok(toProfileResponse(updated));
    }

    private User currentUser(Authentication authentication) {
        return userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ProfileResponse toProfileResponse(User user) {
        return new ProfileResponse(
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getPlateNumber(),
                user.getVehicleType(),
                user.getVehicleModel(),
                user.getVehicleColor(),
                user.isVerified(),
                user.isCurrentlyBlocklisted(),
                user.getBlocklistUntil() != null ? user.getBlocklistUntil().toString() : null,
                user.getMissedBookingsCount()
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public record UpdateProfileRequest(
            String fullName,
            String phoneNumber,
            String address,
            String plateNumber,
            String vehicleType,
            String vehicleModel,
            String vehicleColor
    ) {
    }

    public record ProfileResponse(
            String fullName,
            String email,
            String phoneNumber,
            String address,
            String plateNumber,
            String vehicleType,
            String vehicleModel,
            String vehicleColor,
            boolean verified,
            boolean blocklisted,
            String blocklistUntil,
            int missedBookingsCount
    ) {
    }

    public record ValidationErrorResponse(String message, Map<String, String> fieldErrors) {
    }
}
