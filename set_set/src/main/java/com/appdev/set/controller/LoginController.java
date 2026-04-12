package com.appdev.set.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/login-user")
    public String userLogin() {
        return "login-user";
    }

    @GetMapping("/login-cashier")
    public String cashierLogin() {
        return "login-cashier";
    }

    @GetMapping("/login-admin")
    public String adminLogin() {
        return "login-admin";
    }
} 