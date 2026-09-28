package com.example.shop.exception;

/** The order request is well-formed but cannot be placed, e.g. it names a product that does not exist. */
public class InvalidOrderException extends RuntimeException {

    public InvalidOrderException(String message) {
        super(message);
    }
}
