package com.simplebank.bankapp.services;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.simplebank.bankapp.exceptions.DuplicateEmailException;
import com.simplebank.bankapp.exceptions.InvalidRequestException;
import com.simplebank.bankapp.exceptions.ResourceNotFoundException;
import com.simplebank.bankapp.models.User;
import com.simplebank.bankapp.repos.UserRepository;

@Service
public class UserService {

    private static final int MIN_PASSWORD_LENGTH = 6;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new user for POST /api/auth/register. The password is hashed with
     * BCrypt before it's ever saved - the plain-text value passed in never touches the
     * database. Every new registration gets role "USER"; there's no way to self-assign
     * ADMIN through this or any other endpoint (see AdminBootstrap).
     */
    public User registerUser(String name, String email, String password) {
        if (name == null || name.isBlank()) {
            throw new InvalidRequestException("Name is required");
        }
        if (email == null || email.isBlank()) {
            throw new InvalidRequestException("Email is required");
        }
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            throw new InvalidRequestException("Password must be at least " + MIN_PASSWORD_LENGTH + " characters");
        }

        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException("A user with email " + normalizedEmail + " already exists");
        }

        User user = new User(name.trim(), normalizedEmail);
        user.setPassword(passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
