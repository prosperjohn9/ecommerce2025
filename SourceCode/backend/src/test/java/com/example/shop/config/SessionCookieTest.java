package com.example.shop.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Cookie flags are set by the servlet container, so this runs a real server instead of MockMvc. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SessionCookieTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void sessionCookieIsHttpOnlySecureAndSameSiteLax() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/auth/csrf", String.class);

        List<String> setCookies = response.getHeaders().getOrDefault(HttpHeaders.SET_COOKIE, List.of());
        String sessionCookie = setCookies.stream()
                .filter(cookie -> cookie.startsWith("JSESSIONID="))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No JSESSIONID cookie in " + setCookies));

        assertThat(sessionCookie)
                .contains("HttpOnly")
                .contains("Secure")
                .contains("SameSite=Lax")
                .contains("Path=/");
    }
}
