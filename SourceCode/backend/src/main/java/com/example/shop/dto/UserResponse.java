package com.example.shop.dto;

import com.example.shop.model.UserAccount;

/** What the API reveals about an account. Never includes the password hash. */
public record UserResponse(Long id, String email, String displayName) {

    public static UserResponse from(UserAccount account) {
        return new UserResponse(account.getId(), account.getEmail(), account.getDisplayName());
    }
}
