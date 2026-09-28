package com.example.shop.exception;

/** One message for unknown email and wrong password, so sign-in never reveals which accounts exist. */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid email or password.");
    }
}
