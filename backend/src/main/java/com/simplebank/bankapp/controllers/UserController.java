package com.simplebank.bankapp.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.simplebank.bankapp.dto.UserResponse;
import com.simplebank.bankapp.models.User;
import com.simplebank.bankapp.security.AppUserDetails;
import com.simplebank.bankapp.services.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@AuthenticationPrincipal AppUserDetails currentUser,
                                                 @PathVariable String id) {
        boolean isSelf = currentUser.getUserId().equals(id);
        if (!isSelf && !currentUser.isAdmin()) {
            throw new AccessDeniedException("You do not have access to this user");
        }

        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
