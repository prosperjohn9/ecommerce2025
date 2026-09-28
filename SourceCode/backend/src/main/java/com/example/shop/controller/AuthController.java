package com.example.shop.controller;

import com.example.shop.dto.CsrfResponse;
import com.example.shop.dto.LoginRequest;
import com.example.shop.dto.RegisterRequest;
import com.example.shop.dto.UserResponse;
import com.example.shop.exception.InvalidCredentialsException;
import com.example.shop.exception.TooManyLoginAttemptsException;
import com.example.shop.model.UserAccount;
import com.example.shop.repository.UserAccountRepository;
import com.example.shop.security.LoginRateLimiter;
import com.example.shop.security.SessionSignIn;
import com.example.shop.security.ShopUserDetails;
import com.example.shop.service.AccountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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
    private final AuthenticationManager authenticationManager;
    private final LoginRateLimiter loginRateLimiter;

    public AuthController(AccountService accountService,
                          UserAccountRepository userAccountRepository,
                          SessionSignIn sessionSignIn,
                          AuthenticationManager authenticationManager,
                          LoginRateLimiter loginRateLimiter) {
        this.accountService = accountService;
        this.userAccountRepository = userAccountRepository;
        this.sessionSignIn = sessionSignIn;
        this.authenticationManager = authenticationManager;
        this.loginRateLimiter = loginRateLimiter;
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

    // POST /api/auth/login
    // Same 401 for an unknown email and a wrong password. Rate-limited per email and per IP.
    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request,
                              HttpServletRequest httpRequest,
                              HttpServletResponse httpResponse) {
        String clientIp = httpRequest.getRemoteAddr();
        loginRateLimiter.retryAfter(request.email(), clientIp).ifPresent(wait -> {
            throw new TooManyLoginAttemptsException(wait);
        });

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password()));
        } catch (BadCredentialsException e) {
            loginRateLimiter.recordFailure(request.email(), clientIp);
            throw new InvalidCredentialsException();
        }
        loginRateLimiter.recordSuccess(request.email());
        sessionSignIn.signIn(authentication, httpRequest, httpResponse);

        ShopUserDetails principal = (ShopUserDetails) authentication.getPrincipal();
        return userAccountRepository.findById(principal.getId())
                .map(UserResponse::from)
                .orElseThrow(InvalidCredentialsException::new);
    }

    // POST /api/auth/logout
    // Ends the server-side session and deletes the session cookie. Safe to call when signed out.
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        sessionSignIn.signOut(httpRequest, httpResponse);
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
