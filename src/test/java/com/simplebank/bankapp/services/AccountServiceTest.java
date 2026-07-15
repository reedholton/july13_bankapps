package com.simplebank.bankapp.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.simplebank.bankapp.exceptions.InsufficientBalanceException;
import com.simplebank.bankapp.exceptions.InvalidAmountException;
import com.simplebank.bankapp.exceptions.ResourceNotFoundException;
import com.simplebank.bankapp.models.Account;
import com.simplebank.bankapp.models.User;
import com.simplebank.bankapp.repos.AccountRepository;
import com.simplebank.bankapp.repos.TransactionRepository;
import com.simplebank.bankapp.repos.UserRepository;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    private AccountService accountService;

    @BeforeEach
    void setUp() {
        accountService = new AccountService(accountRepository, userRepository, transactionRepository);
    }

    @Test
    void depositIncreasesBalanceAndRecordsTransaction() {
        Account account = new Account("user-1", "SAVINGS");
        account.setId("acc-1");
        account.setBalance(new BigDecimal("100.00"));

        when(accountRepository.findById("acc-1")).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Account result = accountService.deposit("acc-1", new BigDecimal("50.00"));

        assertThat(result.getBalance()).isEqualByComparingTo("150.00");
    }

    @Test
    void depositWithZeroOrNegativeAmountIsRejected() {
        assertThatThrownBy(() -> accountService.deposit("acc-1", BigDecimal.ZERO))
                .isInstanceOf(InvalidAmountException.class);

        assertThatThrownBy(() -> accountService.deposit("acc-1", new BigDecimal("-10")))
                .isInstanceOf(InvalidAmountException.class);
    }

    @Test
    void withdrawMoreThanBalanceIsRejected() {
        Account account = new Account("user-1", "SAVINGS");
        account.setId("acc-1");
        account.setBalance(new BigDecimal("100.00"));

        when(accountRepository.findById("acc-1")).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> accountService.withdraw("acc-1", new BigDecimal("500.00")))
                .isInstanceOf(InsufficientBalanceException.class);
    }

    @Test
    void withdrawWithinBalanceSucceeds() {
        Account account = new Account("user-1", "SAVINGS");
        account.setId("acc-1");
        account.setBalance(new BigDecimal("100.00"));

        when(accountRepository.findById("acc-1")).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Account result = accountService.withdraw("acc-1", new BigDecimal("40.00"));

        assertThat(result.getBalance()).isEqualByComparingTo("60.00");
    }

    @Test
    void createAccountFailsWhenUserDoesNotExist() {
        when(userRepository.findById("missing-user")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.createAccount("missing-user", "SAVINGS"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createAccountDefaultsToSavingsWhenTypeIsBlank() {
        User owner = new User("Jane Doe", "jane@example.com");
        owner.setId("user-1");

        when(userRepository.findById("user-1")).thenReturn(Optional.of(owner));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Account result = accountService.createAccount("user-1", "  ");

        assertThat(result.getAccountType()).isEqualTo("SAVINGS");
    }
}
