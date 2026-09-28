package com.example.shop.repository;

import com.example.shop.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

    // Callers pass a normalized email (UserAccount.normalizeEmail).
    Optional<UserAccount> findByEmail(String email);

    boolean existsByEmail(String email);
}
