package com.simplebank.bankapp.dto;

import com.simplebank.bankapp.models.User;

public class UserResponse {

    private String userId;
    private String name;
    private String email;

    public static UserResponse from(User user) {
        UserResponse response = new UserResponse();
        response.userId = user.getId();
        response.name = user.getName();
        response.email = user.getEmail();
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
}
