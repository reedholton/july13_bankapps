package com.simplebank.bankapp.dto;

import java.math.BigDecimal;

import com.simplebank.bankapp.models.Account;
import com.simplebank.bankapp.models.User;

public class AccountResponse {

    private String accountId;
    private String userName;
    private String accountType;
    private BigDecimal balance;

    public static AccountResponse from(Account account, User owner) {
        AccountResponse response = new AccountResponse();
        response.accountId = account.getId();
        response.userName = owner != null ? owner.getName() : null;
        response.accountType = account.getAccountType();
        response.balance = account.getBalance();
        return response;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
}
