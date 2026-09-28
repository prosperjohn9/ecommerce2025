package com.example.shop.dto;

/** The CSRF token the app must send back, and the header to send it in. */
public record CsrfResponse(String headerName, String token) {
}
