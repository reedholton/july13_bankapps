package com.simplebank.bankapp.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.simplebank.bankapp.exceptions.DuplicateEmailException;
import com.simplebank.bankapp.exceptions.InvalidRequestException;
import com.simplebank.bankapp.models.User;
import com.simplebank.bankapp.repos.UserRepository;

// Unit tests for UserService - repository and password encoder are both mocked, so no
// real database or real BCrypt hashing runs during these tests.
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @Test
    void registerUserHashesThePasswordBeforeSaving() {
        userService = new UserService(userRepository, passwordEncoder);

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed-value");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.registerUser("Jane Doe", "jane@example.com", "secret123");

        // The plain-text password should never end up on the saved user - only the
        // encoder's output should.
        assertThat(result.getPassword()).isEqualTo("hashed-value");
        assertThat(result.getPassword()).isNotEqualTo("secret123");
        assertThat(result.getRole()).isEqualTo("USER");
    }

    @Test
    void registerUserRejectsDuplicateEmail() {
        userService = new UserService(userRepository, passwordEncoder);

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.registerUser("Jane Doe", "jane@example.com", "secret123"))
                .isInstanceOf(DuplicateEmailException.class);
    }

    @Test
    void registerUserRejectsShortPassword() {
        userService = new UserService(userRepository, passwordEncoder);

        assertThatThrownBy(() -> userService.registerUser("Jane Doe", "jane@example.com", "abc"))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void registerUserRejectsBlankName() {
        userService = new UserService(userRepository, passwordEncoder);

        assertThatThrownBy(() -> userService.registerUser("  ", "jane@example.com", "secret123"))
                .isInstanceOf(InvalidRequestException.class);
    }
}
