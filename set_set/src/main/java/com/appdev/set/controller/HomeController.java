package com.appdev.set.controller;

import com.appdev.set.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class HomeController {
    
    @Autowired
    private UserService userService;
    
    // Handle root path and index
    @GetMapping({"", "/", "/index", "/home"})
    public String index() {
        return "index";
    }
    
    // Handle login with type parameter
    @GetMapping("/login")
    public String login(@RequestParam(value = "type", required = false) String type, Model model) {
        if ("admin".equalsIgnoreCase(type)) {
            return "login-admin";
        } else if ("cashier".equalsIgnoreCase(type)) {
            return "login-cashier";
        } else {
            // If type is missing or not recognized, always show user login
            return "login-user";
        }
    }
    
    // Handle advance booking redirect
    @GetMapping("/book")
    public String advanceBooking() {
        return "redirect:/register";
    }
    
    // REMOVED: /notifications mapping to avoid conflict with NotificationController
    // The NotificationController should handle /notifications instead
}