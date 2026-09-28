package com.example.shop.dto;

import com.example.shop.model.UserAccount;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank @Size(max = 254) String email,
        @NotEmpty @Size(max = 128) String password) {

    public LoginRequest {
        email = UserAccount.normalizeEmail(email);
    }

    // Keep the password out of logs and error messages.
    @Override
    public String toString() {
        return "LoginRequest[email=" + email + ", password=<redacted>]";
    }
}
