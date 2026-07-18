package com.simplebank.bankapp.dto;

/** Request body for POST /api/accounts: { "accountType": "SAVINGS" } */
public class CreateAccountRequest {

    private String accountType;

    public CreateAccountRequest() {
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }
}
