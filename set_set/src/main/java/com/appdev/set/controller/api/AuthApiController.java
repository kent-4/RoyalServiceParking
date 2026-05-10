package com.appdev.set.controller.api;

import com.appdev.set.controller.api.response.ApiErrorResponse;
import com.appdev.set.controller.api.response.ValidationErrorResponse;
import com.appdev.set.model.User;
import com.appdev.set.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.Period;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthApiController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    public AuthApiController(AuthenticationManager authenticationManager, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
    }

    @GetMapping("/me")
    public AuthSessionResponse currentSession(Authentication authentication) {
        return buildSessionResponse(authentication);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            Authentication authenticated = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authenticated);
            SecurityContextHolder.setContext(context);

            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

            return ResponseEntity.ok(buildSessionResponse(authenticated));
        } catch (BadCredentialsException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiErrorResponse.of("Invalid username or password."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationRequest request) {
        Map<String, String> fieldErrors = validateRegistrationRequest(request);
        if (!fieldErrors.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ValidationErrorResponse.of("Review the registration form and try again.", fieldErrors));
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim());
        user.setDateOfBirth(request.dateOfBirth());
        user.setPhoneNumber(request.phoneNumber().trim());
        user.setGender(request.gender().trim());
        user.setAddress(trimToNull(request.address()));
        user.setPlateNumber(request.plateNumber().trim());
        user.setVehicleType(request.vehicleType().trim());
        user.setVehicleModel(request.vehicleModel().trim());
        user.setVehicleColor(request.vehicleColor().trim());
        user.setPassword(request.password());

        try {
            userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "message", "Registration successful. Please check your email to verify your account.",
                            "email", user.getEmail()
                    )
            );
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(ApiErrorResponse.of(exception.getMessage()));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String token) {
        boolean verified = userService.verifyUser(token);
        if (verified) {
            return ResponseEntity.ok(Map.of(
                    "verified", true,
                    "message", "Email verified successfully. You can now sign in."
            ));
        }

        return ResponseEntity.badRequest().body(Map.of(
                "verified", false,
                "message", "Invalid or expired verification token."
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String email = request.email() == null ? "" : request.email().trim();
        if (email.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    ValidationErrorResponse.of(
                            "Email is required.",
                            Map.of("email", "Email is required.")
                    )
            );
        }

        if (!userService.isEmailVerified(email)) {
            return ResponseEntity.badRequest().body(ApiErrorResponse.of(
                    "Email not found or not verified. Please check your email or register a new account."
            ));
        }

        userService.initiatePasswordReset(email);
        return ResponseEntity.ok(Map.of(
                "message", "If your email exists in our system, you will receive a password reset link."
        ));
    }

    @GetMapping("/reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        boolean valid = userService.isValidResetToken(token);
        if (valid) {
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "message", "Reset token accepted. You can now choose a new password."
            ));
        }

        return ResponseEntity.badRequest().body(Map.of(
                "valid", false,
                "message", "Invalid or expired reset token. Please request a new password reset link."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();

        if (isBlank(request.token())) {
            fieldErrors.put("token", "Reset token is required.");
        }

        if (isBlank(request.password())) {
            fieldErrors.put("password", "Password is required.");
        } else if (request.password().length() < 6) {
            fieldErrors.put("password", "Password must be at least 6 characters long.");
        }

        if (isBlank(request.confirmPassword())) {
            fieldErrors.put("confirmPassword", "Confirm your new password.");
        } else if (!request.confirmPassword().equals(request.password())) {
            fieldErrors.put("confirmPassword", "Passwords do not match.");
        }

        if (!fieldErrors.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ValidationErrorResponse.of("Review the password fields and try again.", fieldErrors));
        }

        boolean reset = userService.resetPassword(request.token(), request.password());
        if (reset) {
            return ResponseEntity.ok(Map.of(
                    "message", "Password reset successfully. You can now log in with your new password."
            ));
        }

        return ResponseEntity.badRequest().body(ApiErrorResponse.of("Invalid or expired reset token."));
    }

    private AuthSessionResponse buildSessionResponse(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || AuthorityUtils.authorityListToSet(authentication.getAuthorities()).contains("ROLE_ANONYMOUS")) {
            return new AuthSessionResponse(false, null, null, null, null, false, false, null);
        }

        String role = resolveRole(authentication);
        String username = authentication.getName();
        Optional<User> userOpt = userService.findByEmail(username);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return new AuthSessionResponse(
                    true,
                    role,
                    username,
                    user.getFullName(),
                    user.getEmail(),
                    user.isVerified(),
                    user.isCurrentlyBlocklisted(),
                    user.getBlocklistUntil() != null ? user.getBlocklistUntil().toString() : null
            );
        }

        String displayName = switch (role) {
            case "ADMIN" -> "Admin Operator";
            case "CASHIER" -> "Cashier Operator";
            default -> username;
        };

        return new AuthSessionResponse(true, role, username, displayName, null, true, false, null);
    }

    private Map<String, String> validateRegistrationRequest(RegistrationRequest request) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();

        if (isBlank(request.fullName())) {
            fieldErrors.put("fullName", "Full name is required.");
        }

        if (isBlank(request.email())) {
            fieldErrors.put("email", "Email is required.");
        } else if (!request.email().contains("@")) {
            fieldErrors.put("email", "Email should be valid.");
        }

        if (request.dateOfBirth() == null) {
            fieldErrors.put("dateOfBirth", "Date of birth is required.");
        } else if (Period.between(request.dateOfBirth(), LocalDate.now()).getYears() < 15) {
            fieldErrors.put("dateOfBirth", "You must be at least 15 years old.");
        }

        if (isBlank(request.phoneNumber())) {
            fieldErrors.put("phoneNumber", "Phone number is required.");
        }

        if (isBlank(request.gender())) {
            fieldErrors.put("gender", "Gender is required.");
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

        if (isBlank(request.password())) {
            fieldErrors.put("password", "Password is required.");
        } else if (request.password().length() < 6) {
            fieldErrors.put("password", "Password must be at least 6 characters long.");
        }

        if (isBlank(request.confirmPassword())) {
            fieldErrors.put("confirmPassword", "Confirm your password.");
        } else if (!request.confirmPassword().equals(request.password())) {
            fieldErrors.put("confirmPassword", "Passwords do not match.");
        }

        return fieldErrors;
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

    private String resolveRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }

    public record LoginRequest(String username, String password, String loginType) {
    }

    public record RegistrationRequest(
            String fullName,
            String email,
            LocalDate dateOfBirth,
            String phoneNumber,
            String gender,
            String address,
            String plateNumber,
            String vehicleType,
            String vehicleModel,
            String vehicleColor,
            String password,
            String confirmPassword
    ) {
    }

    public record ForgotPasswordRequest(String email) {
    }

    public record ResetPasswordRequest(String token, String password, String confirmPassword) {
    }

    public record AuthSessionResponse(
            boolean authenticated,
            String role,
            String username,
            String displayName,
            String email,
            boolean verified,
            boolean blocklisted,
            String blocklistUntil
    ) {
    }
}
