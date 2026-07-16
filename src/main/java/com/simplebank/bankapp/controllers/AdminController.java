package com.simplebank.bankapp.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.simplebank.bankapp.dto.AccountResponse;
import com.simplebank.bankapp.dto.UserResponse;
import com.simplebank.bankapp.services.AccountService;
import com.simplebank.bankapp.services.UserService;

/**
 * Everything here is restricted to ROLE_ADMIN at the URL level (see
 * SecurityConfiguration: "/api/admin/**" requires hasRole("ADMIN")), so there's no
 * per-method role check needed in this class itself - if a non-admin's request even
 * reaches this controller, something upstream is misconfigured.
 *
 * "See all accounts, transactions, etc." for a specific account is already covered by
 * the regular account endpoints in AccountController - its ownership check lets an
 * admin through for any account, not just their own. This controller is only for the
 * "browse everything without already knowing an id" views.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AccountService accountService;
    private final UserService userService;

    public AdminController(AccountService accountService, UserService userService) {
        this.accountService = accountService;
        this.userService = userService;
    }

    @GetMapping("/accounts")
    public List<AccountResponse> getAllAccounts() {
        return accountService.getAllAccounts().stream()
                .map(account -> AccountResponse.from(account, accountService.getAccountOwner(account)))
                .toList();
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers().stream()
                .map(UserResponse::from)
                .toList();
    }
}
