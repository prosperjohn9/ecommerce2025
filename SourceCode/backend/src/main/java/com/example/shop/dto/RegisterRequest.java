package com.example.shop.dto;

import com.example.shop.model.UserAccount;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Sign-up form. Password rule follows NIST SP 800-63B: length only, no composition rules.
 * The upper bound stops very long inputs from being used to burn hashing time.
 */
public record RegisterRequest(
        @NotBlank @Email @Size(max = 254) String email,
        @NotNull @Size(min = 12, max = 128) String password,
        @NotBlank @Size(min = 3, max = 50) String displayName) {

    public RegisterRequest {
        email = UserAccount.normalizeEmail(email);
        displayName = displayName == null ? null : displayName.strip();
    }

    // Keep the password out of logs and error messages.
    @Override
    public String toString() {
        return "RegisterRequest[email=" + email + ", displayName=" + displayName + ", password=<redacted>]";
    }
}
