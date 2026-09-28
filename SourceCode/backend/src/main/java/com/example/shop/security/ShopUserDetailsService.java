package com.example.shop.security;

import com.example.shop.model.UserAccount;
import com.example.shop.repository.UserAccountRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** Looks up accounts by email for Spring Security. Also stops Boot from creating a default in-memory user. */
@Service
public class ShopUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    public ShopUserDetailsService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        return userAccountRepository.findByEmail(UserAccount.normalizeEmail(email))
                .map(ShopUserDetails::from)
                .orElseThrow(() -> new UsernameNotFoundException("No account for this email"));
    }
}
