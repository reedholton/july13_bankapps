package com.simplebank.bankapp.exceptions;

/** Thrown when a withdrawal exceeds the account balance. Maps to HTTP 400 (business rule #1). */
public class InsufficientBalanceException extends RuntimeException {

    public InsufficientBalanceException(String message) {
        super(message);
    }
}
