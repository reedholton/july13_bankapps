package com.simplebank.bankapp.exceptions;

/** Thrown when a request body is missing required fields. Maps to HTTP 400. */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}
