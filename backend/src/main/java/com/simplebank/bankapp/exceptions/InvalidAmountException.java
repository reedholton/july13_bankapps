package com.simplebank.bankapp.exceptions;

/** Thrown when a deposit/withdraw amount is null, zero, or negative. Maps to HTTP 400 (business rule #2). */
public class InvalidAmountException extends RuntimeException {

    public InvalidAmountException(String message) {
        super(message);
    }
}
