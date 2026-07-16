package com.simplebank.bankapp.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;

import com.simplebank.bankapp.exceptions.InsufficientBalanceException;
import com.simplebank.bankapp.exceptions.InvalidAmountException;
import com.simplebank.bankapp.exceptions.ResourceNotFoundException;
import com.simplebank.bankapp.models.Account;
import com.simplebank.bankapp.models.Transaction;
import com.simplebank.bankapp.models.User;
import com.simplebank.bankapp.repos.AccountRepository;
import com.simplebank.bankapp.repos.TransactionRepository;
import com.simplebank.bankapp.repos.UserRepository;

@Service
public class AccountService {

    private static final String DEPOSIT = "DEPOSIT";
    private static final String WITHDRAW = "WITHDRAW";

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public AccountService(AccountRepository accountRepository,
                           UserRepository userRepository,
                           TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    public Account createAccount(String userId, String accountType) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String type = (accountType == null || accountType.isBlank())
                ? "SAVINGS"
                : accountType.trim().toUpperCase();

        Account account = new Account(owner.getId(), type);
        return accountRepository.save(account);
    }

    public Account getAccountById(String accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));
    }

    public User getAccountOwner(Account account) {
        return userRepository.findById(account.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + account.getUserId()));
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    /** Used by GET /api/accounts, so each user only sees their own accounts. */
    public List<Account> getAccountsByUserId(String userId) {
        return accountRepository.findByUserId(userId);
    }

    /** Business rule: deposit amount must be positive. */
    public Account deposit(String accountId, BigDecimal amount) {
        validatePositiveAmount(amount, "Deposit");

        Account account = getAccountById(accountId);
        account.setBalance(account.getBalance().add(amount).setScale(2, RoundingMode.HALF_UP));
        accountRepository.save(account);

        recordTransaction(accountId, DEPOSIT, amount);
        return account;
    }

    /** Business rule: cannot withdraw more than the current balance. */
    public Account withdraw(String accountId, BigDecimal amount) {
        validatePositiveAmount(amount, "Withdrawal");

        Account account = getAccountById(accountId);
        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance. Current balance: " + account.getBalance() + ", requested: " + amount);
        }

        account.setBalance(account.getBalance().subtract(amount).setScale(2, RoundingMode.HALF_UP));
        accountRepository.save(account);

        recordTransaction(accountId, WITHDRAW, amount);
        return account;
    }

    public List<Transaction> getTransactions(String accountId) {
        // Ensure the account exists before returning its (possibly empty) history.
        getAccountById(accountId);
        return transactionRepository.findByAccountIdOrderByCreatedAtDesc(accountId);
    }

    private void validatePositiveAmount(BigDecimal amount, String action) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAmountException(action + " amount must be positive");
        }
    }

    private void recordTransaction(String accountId, String type, BigDecimal amount) {
        Transaction transaction = new Transaction(accountId, type, amount);
        transactionRepository.save(transaction);
    }
}
