package com.example.shop.service;

import com.example.shop.dto.RegisterRequest;
import com.example.shop.exception.EmailAlreadyRegisteredException;
import com.example.shop.model.UserAccount;
import com.example.shop.repository.UserAccountRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AccountService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserAccount register(RegisterRequest request) {
        if (userAccountRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyRegisteredException();
        }
        UserAccount account = new UserAccount(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.displayName(),
                Instant.now());
        try {
            return userAccountRepository.saveAndFlush(account);
        } catch (DataIntegrityViolationException e) {
            // Another request registered the same email between the check and the insert.
            throw new EmailAlreadyRegisteredException();
        }
    }
}
