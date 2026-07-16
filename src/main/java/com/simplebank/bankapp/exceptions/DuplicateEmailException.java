package com.simplebank.bankapp.exceptions;

/** Thrown when creating a user with an email that already exists. Maps to HTTP 409. */
public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String message) {
        super(message);
    }
}
