package com.simplebank.bankapp.dto;

import com.simplebank.bankapp.models.User;

/** Response shape for user endpoints. Never includes the password hash. */
public class UserResponse {

    private String userId;
    private String name;
    private String email;
    private String role;

    public static UserResponse from(User user) {
        UserResponse response = new UserResponse();
        response.userId = user.getId();
        response.name = user.getName();
        response.email = user.getEmail();
        response.role = user.getRole();
        return response;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
