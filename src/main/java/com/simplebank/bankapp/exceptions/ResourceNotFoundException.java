package com.simplebank.bankapp.exceptions;

/** Thrown when a user, account, or other resource can't be found by id. Maps to HTTP 404. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
