package com.simplebank.bankapp.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.simplebank.bankapp.dto.AuthResponse;
import com.simplebank.bankapp.dto.ErrorResponse;
import com.simplebank.bankapp.dto.LoginRequest;
import com.simplebank.bankapp.dto.RegisterRequest;
import com.simplebank.bankapp.models.User;
import com.simplebank.bankapp.security.AppUserDetails;
import com.simplebank.bankapp.security.JwtService;
import com.simplebank.bankapp.services.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    /** Creates the account and logs them in immediately - no separate login step needed right after signing up. */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        User user = userService.registerUser(request.getName(), request.getEmail(), request.getPassword());
        AppUserDetails principal = new AppUserDetails(user);
        String token = jwtService.generateToken(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(AuthResponse.from(token, principal));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            AppUserDetails principal = (AppUserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(principal);
            return ResponseEntity.ok(AuthResponse.from(token, principal));
        } catch (BadCredentialsException ex) {
            // Deliberately vague - "invalid email or password" rather than saying which
            // one was wrong, so this can't be used to find out whether a given email is
            // registered.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid email or password"));
        }
    }
}
