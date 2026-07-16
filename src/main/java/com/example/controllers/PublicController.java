package com.example.controllers;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * A "regular" endpoint - accessible without any token, as usual, per permitAll() on
 * "/public/**" in SecurityConfiguration.
 */
@RestController
@RequestMapping("/public")
public class PublicController {

    @GetMapping("/hello")
    public Map<String, String> hello() {
        return Map.of("message", "This is a public endpoint - no token required.");
    }
}
