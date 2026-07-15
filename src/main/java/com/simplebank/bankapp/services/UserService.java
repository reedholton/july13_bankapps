package com.simplebank.bankapp.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.simplebank.bankapp.exceptions.DuplicateEmailException;
import com.simplebank.bankapp.exceptions.InvalidRequestException;
import com.simplebank.bankapp.exceptions.ResourceNotFoundException;
import com.simplebank.bankapp.models.User;
import com.simplebank.bankapp.repos.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(String name, String email) {
        if (name == null || name.isBlank()) {
            throw new InvalidRequestException("Name is required");
        }
        if (email == null || email.isBlank()) {
            throw new InvalidRequestException("Email is required");
        }

        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException("A user with email " + normalizedEmail + " already exists");
        }

        User user = new User(name.trim(), normalizedEmail);
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
