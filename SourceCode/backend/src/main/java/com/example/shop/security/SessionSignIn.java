package com.example.shop.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.authentication.logout.CompositeLogoutHandler;
import org.springframework.security.web.authentication.logout.CookieClearingLogoutHandler;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Component;

/**
 * Signs users in and out of the server-side session, for the JSON auth endpoints.
 * Sign-in gives the session a new id (blocks session fixation) and replaces the CSRF token,
 * the same steps Spring's own login filters take. Sign-out destroys the session on the
 * server and tells the browser to delete the session cookie.
 */
@Component
public class SessionSignIn {

    private final SecurityContextHolderStrategy contextHolder = SecurityContextHolder.getContextHolderStrategy();
    private final SessionAuthenticationStrategy sessionAuthenticationStrategy;
    private final SecurityContextRepository securityContextRepository;
    private final LogoutHandler logoutHandler;

    public SessionSignIn(SessionAuthenticationStrategy sessionAuthenticationStrategy,
                         SecurityContextRepository securityContextRepository,
                         @Value("${server.servlet.session.cookie.name:JSESSIONID}") String sessionCookieName) {
        this.sessionAuthenticationStrategy = sessionAuthenticationStrategy;
        this.securityContextRepository = securityContextRepository;

        SecurityContextLogoutHandler endSession = new SecurityContextLogoutHandler();
        endSession.setSecurityContextRepository(securityContextRepository);
        this.logoutHandler = new CompositeLogoutHandler(
                endSession,
                new CookieClearingLogoutHandler(sessionCookieName));
    }

    public void signIn(Authentication authentication, HttpServletRequest request, HttpServletResponse response) {
        sessionAuthenticationStrategy.onAuthentication(authentication, request, response);
        SecurityContext context = contextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        contextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }

    public void signOut(HttpServletRequest request, HttpServletResponse response) {
        logoutHandler.logout(request, response, contextHolder.getContext().getAuthentication());
    }
}
