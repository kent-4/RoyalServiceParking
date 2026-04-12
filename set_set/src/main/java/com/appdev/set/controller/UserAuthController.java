package com.appdev.set.controller;

import com.appdev.set.model.User;
import com.appdev.set.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class UserAuthController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/register")
    public String registerForm(Model model) {
        model.addAttribute("user", new User());
        return "register";
    }
    
    @PostMapping("/register")
    public String registerSubmit(@Valid @ModelAttribute User user, BindingResult result, Model model) {
        if (result.hasErrors()) {
            return "register";
        }
        
        try {
            userService.registerUser(user);
            model.addAttribute("success", "Registration successful! Please check your email to verify your account.");
            return "register-success";
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            return "register";
        }
    }
    
    @GetMapping("/verify")
    public String verifyEmail(@RequestParam String token, Model model) {
        boolean verified = userService.verifyUser(token);
        
        if (verified) {
            model.addAttribute("message", "Email verified successfully! You can now login.");
        } else {
            model.addAttribute("error", "Invalid or expired verification token.");
        }
        
        return "verify";
    }
    
    @GetMapping("/forgot-password")
    public String forgotPassword() {
        return "forgot-password";
    }
    
    @PostMapping("/forgot-password")
    public String processForgotPassword(@RequestParam String email, Model model, RedirectAttributes redirectAttributes) {
        try {
            // Check if email exists and is verified
            if (!userService.isEmailVerified(email)) {
                model.addAttribute("error", "Email not found or not verified. Please check your email or register a new account.");
                return "forgot-password";
            }
            
            userService.initiatePasswordReset(email);
            redirectAttributes.addFlashAttribute("message", "If your email exists in our system, you will receive a password reset link.");
            return "redirect:/forgot-password-confirmation";
        } catch (Exception e) {
            model.addAttribute("error", "An error occurred: " + e.getMessage());
            return "forgot-password";
        }
    }
    
    @GetMapping("/forgot-password-confirmation")
    public String forgotPasswordConfirmation() {
        return "forgot-password-confirmation";
    }
    
    @GetMapping("/reset-password")
    public String resetPassword(@RequestParam String token, Model model) {
        // Validate token before showing the reset form
        if (!userService.isValidResetToken(token)) {
            model.addAttribute("error", "Invalid or expired reset token. Please request a new password reset link.");
            return "reset-error";
        }
        
        model.addAttribute("token", token);
        return "reset-password";
    }
    
    @PostMapping("/reset-password")
    public String processResetPassword(@RequestParam String token, 
                                      @RequestParam String password, 
                                      @RequestParam String confirmPassword, 
                                      Model model,
                                      RedirectAttributes redirectAttributes) {
        if (!password.equals(confirmPassword)) {
            model.addAttribute("error", "Passwords do not match");
            model.addAttribute("token", token);
            return "reset-password";
        }
        
        try {
            boolean reset = userService.resetPassword(token, password);
            
            if (reset) {
                redirectAttributes.addFlashAttribute("message", "Password reset successfully! You can now login with your new password.");
                return "redirect:/reset-success";
            } else {
                model.addAttribute("error", "Invalid or expired reset token.");
                return "reset-password";
            }
        } catch (Exception e) {
            model.addAttribute("error", "An error occurred: " + e.getMessage());
            model.addAttribute("token", token);
            return "reset-password";
        }
    }
    
    @GetMapping("/reset-success")
    public String resetSuccess() {
        return "reset-success";
    }
    
    @GetMapping("/login-error")
    public String loginError(@RequestParam(value = "type", required = false) String type, Model model) {
        model.addAttribute("error", "Invalid username or password. Please check your credentials and try again.");
        if ("admin".equalsIgnoreCase(type)) {
            return "login-admin";
        } else if ("cashier".equalsIgnoreCase(type)) {
            return "login-cashier";
        } else {
            return "login-user";
        }
    }
}