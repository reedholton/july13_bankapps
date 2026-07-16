package com.example.controllers;

import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The sensitive endpoint: http://localhost:8080/admin
 *
 * Locked down in SecurityConfiguration to require a valid JWT AND the ADMIN role
 * (hasRole("ADMIN") on "/admin/**"). Anyone else - no token, an expired token, a
 * tampered token, or a valid token belonging to a non-admin user - never reaches this
 * method; they're rejected earlier in the filter chain with "Access Forbidden".
 */
@RestController
@RequestMapping("/admin")
public class AdminController {

    @GetMapping
    public Map<String, String> adminOnly(@AuthenticationPrincipal UserDetails userDetails) {
        return Map.of("message", "Welcome, " + userDetails.getUsername() + ". You have ADMIN access.");
    }
}
