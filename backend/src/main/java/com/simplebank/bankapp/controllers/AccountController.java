package com.simplebank.bankapp.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
import com.simplebank.bankapp.security.AppUserDetails;
import com.simplebank.bankapp.services.AccountService;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(@AuthenticationPrincipal AppUserDetails currentUser,
                                                           @RequestBody CreateAccountRequest request) {
        Account account = accountService.createAccount(currentUser.getUserId(), request.getAccountType());
        User owner = accountService.getAccountOwner(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(AccountResponse.from(account, owner));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccount(@AuthenticationPrincipal AppUserDetails currentUser,
                                                        @PathVariable String id) {
        Account account = accountService.getAccountById(id);
        requireOwnerOrAdmin(account, currentUser);
        User owner = accountService.getAccountOwner(account);
        return ResponseEntity.ok(AccountResponse.from(account, owner));
    }

    /** The signed-in user's own accounts. For every account regardless of owner, see AdminController. */
    @GetMapping
    public List<AccountResponse> getMyAccounts(@AuthenticationPrincipal AppUserDetails currentUser) {
        User owner = asOwner(currentUser);
        return accountService.getAccountsByUserId(currentUser.getUserId()).stream()
                .map(account -> AccountResponse.from(account, owner))
                .toList();
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<AccountResponse> deposit(@AuthenticationPrincipal AppUserDetails currentUser,
                                                     @PathVariable String id,
                                                     @RequestBody AmountRequest request) {
        Account existing = accountService.getAccountById(id);
        requireOwnerOrAdmin(existing, currentUser);

        Account account = accountService.deposit(id, request.getAmount());
        User owner = accountService.getAccountOwner(account);
        return ResponseEntity.ok(AccountResponse.from(account, owner));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<AccountResponse> withdraw(@AuthenticationPrincipal AppUserDetails currentUser,
                                                      @PathVariable String id,
                                                      @RequestBody AmountRequest request) {
        Account existing = accountService.getAccountById(id);
        requireOwnerOrAdmin(existing, currentUser);

        Account account = accountService.withdraw(id, request.getAmount());
        User owner = accountService.getAccountOwner(account);
        return ResponseEntity.ok(AccountResponse.from(account, owner));
    }

    @GetMapping("/{id}/transactions")
    public List<TransactionResponse> getTransactions(@AuthenticationPrincipal AppUserDetails currentUser,
                                                       @PathVariable String id) {
        Account account = accountService.getAccountById(id);
        requireOwnerOrAdmin(account, currentUser);

        return accountService.getTransactions(id).stream()
                .map(TransactionResponse::from)
                .toList();
    }

    private void requireOwnerOrAdmin(Account account, AppUserDetails currentUser) {
        boolean isOwner = account.getUserId().equals(currentUser.getUserId());
        if (!isOwner && !currentUser.isAdmin()) {
            throw new AccessDeniedException("You do not have access to this account");
        }
    }

    // getMyAccounts already knows the owner is currentUser - build a User view of them
    // without an extra database round trip per account.
    private User asOwner(AppUserDetails currentUser) {
        User user = new User(currentUser.getName(), currentUser.getEmail());
        user.setId(currentUser.getUserId());
        return user;
    }
}
