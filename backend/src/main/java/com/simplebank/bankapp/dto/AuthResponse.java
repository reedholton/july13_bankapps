package com.simplebank.bankapp.dto;

import com.simplebank.bankapp.security.AppUserDetails;

/** Response body for a successful POST /api/auth/register or /api/auth/login */
public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private String userId;
    private String name;
    private String email;
    private String role;

    public static AuthResponse from(String token, AppUserDetails principal) {
        AuthResponse response = new AuthResponse();
        response.token = token;
        response.userId = principal.getUserId();
        response.name = principal.getName();
        response.email = principal.getEmail();
        response.role = principal.getRole();
        return response;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
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
