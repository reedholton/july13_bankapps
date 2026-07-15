package com.simplebank.bankapp.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.simplebank.bankapp.dto.AccountResponse;
import com.simplebank.bankapp.dto.AmountRequest;
import com.simplebank.bankapp.dto.CreateAccountRequest;
import com.simplebank.bankapp.dto.TransactionResponse;
import com.simplebank.bankapp.models.Account;
import com.simplebank.bankapp.models.User;
import com.simplebank.bankapp.services.AccountService;

/**
 * Implements the REST API described in section 5.4 of the project document:
 * POST   /api/accounts
 * GET    /api/accounts/{id}
 * POST   /api/accounts/{id}/deposit
 * POST   /api/accounts/{id}/withdraw
 * GET    /api/accounts/{id}/transactions
 */
@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(@RequestBody CreateAccountRequest request) {
        Account account = accountService.createAccount(request.getUserId(), request.getAccountType());
        User owner = accountService.getAccountOwner(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(AccountResponse.from(account, owner));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccount(@PathVariable String id) {
        Account account = accountService.getAccountById(id);
        User owner = accountService.getAccountOwner(account);
        return ResponseEntity.ok(AccountResponse.from(account, owner));
    }

    @GetMapping
    public List<AccountResponse> getAllAccounts() {
        return accountService.getAllAccounts().stream()
                .map(account -> AccountResponse.from(account, accountService.getAccountOwner(account)))
                .toList();
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<AccountResponse> deposit(@PathVariable String id, @RequestBody AmountRequest request) {
        Account account = accountService.deposit(id, request.getAmount());
        User owner = accountService.getAccountOwner(account);
        return ResponseEntity.ok(AccountResponse.from(account, owner));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<AccountResponse> withdraw(@PathVariable String id, @RequestBody AmountRequest request) {
        Account account = accountService.withdraw(id, request.getAmount());
        User owner = accountService.getAccountOwner(account);
        return ResponseEntity.ok(AccountResponse.from(account, owner));
    }

    @GetMapping("/{id}/transactions")
    public List<TransactionResponse> getTransactions(@PathVariable String id) {
        return accountService.getTransactions(id).stream()
                .map(TransactionResponse::from)
                .toList();
    }
}
