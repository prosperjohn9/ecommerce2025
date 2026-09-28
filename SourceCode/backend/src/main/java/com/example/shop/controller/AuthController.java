package com.example.shop.controller;

import com.example.shop.dto.CsrfResponse;
import com.example.shop.dto.RegisterRequest;
import com.example.shop.dto.UserResponse;
import com.example.shop.model.UserAccount;
import com.example.shop.repository.UserAccountRepository;
import com.example.shop.security.SessionSignIn;
import com.example.shop.security.ShopUserDetails;
import com.example.shop.service.AccountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AccountService accountService;
    private final UserAccountRepository userAccountRepository;
    private final SessionSignIn sessionSignIn;

    public AuthController(AccountService accountService,
                          UserAccountRepository userAccountRepository,
                          SessionSignIn sessionSignIn) {
        this.accountService = accountService;
        this.userAccountRepository = userAccountRepository;
        this.sessionSignIn = sessionSignIn;
    }

    // GET /api/auth/csrf
    // The app calls this before any POST, and again after sign-in (the token changes).
    @GetMapping("/csrf")
    public CsrfResponse csrf(CsrfToken csrfToken) {
        return new CsrfResponse(csrfToken.getHeaderName(), csrfToken.getToken());
    }

    // POST /api/auth/register
    // Creates the account and signs the new user in.
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request,
                                 HttpServletRequest httpRequest,
                                 HttpServletResponse httpResponse) {
        UserAccount account = accountService.register(request);
        ShopUserDetails principal = new ShopUserDetails(account.getId(), account.getEmail(), null);
        sessionSignIn.signIn(
                UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities()),
                httpRequest,
                httpResponse);
        return UserResponse.from(account);
    }

    // GET /api/auth/me
    // The signed-in user, or 401 (enforced by SecurityConfig).
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal ShopUserDetails principal) {
        return userAccountRepository.findById(principal.getId())
                .map(UserResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
