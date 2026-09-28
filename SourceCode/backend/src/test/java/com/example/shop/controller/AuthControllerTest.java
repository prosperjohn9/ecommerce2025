package com.example.shop.controller;

import com.example.shop.model.UserAccount;
import com.example.shop.repository.UserAccountRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.emptyString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    private static final String PASSWORD = "correct horse battery";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void csrfEndpointReturnsHeaderNameAndToken() throws Exception {
        mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN"))
                .andExpect(jsonPath("$.token", not(emptyString())));
    }

    @Test
    void registerCreatesAccountAndStartsSession() throws Exception {
        String id = UUID.randomUUID().toString();
        String expectedEmail = "new.user-" + id + "@example.com";
        MockHttpSession session = new MockHttpSession();

        register(session, "  New.User-" + id + "@Example.COM ", PASSWORD, "  Ada  ")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.email").value(expectedEmail))
                .andExpect(jsonPath("$.displayName").value("Ada"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(expectedEmail))
                .andExpect(jsonPath("$.displayName").value("Ada"));
    }

    @Test
    void storesArgon2idHashInsteadOfPassword() throws Exception {
        String first = uniqueEmail();
        String second = uniqueEmail();
        register(new MockHttpSession(), first, PASSWORD, "First").andExpect(status().isCreated());
        register(new MockHttpSession(), second, PASSWORD, "Second").andExpect(status().isCreated());

        String firstHash = userAccountRepository.findByEmail(first).map(UserAccount::getPasswordHash).orElseThrow();
        String secondHash = userAccountRepository.findByEmail(second).map(UserAccount::getPasswordHash).orElseThrow();

        // Argon2id with the OWASP minimum: 19 MiB memory, 2 iterations, parallelism 1.
        assertThat(firstHash).startsWith("{argon2}$argon2id$v=19$m=19456,t=2,p=1$");
        assertThat(firstHash).doesNotContain(PASSWORD);
        assertThat(passwordEncoder.matches(PASSWORD, firstHash)).isTrue();
        assertThat(passwordEncoder.matches("wrong password!!", firstHash)).isFalse();
        // Random salt: the same password never gives the same hash.
        assertThat(secondHash).isNotEqualTo(firstHash);
    }

    @Test
    void rejectsDuplicateEmailIgnoringCase() throws Exception {
        String id = UUID.randomUUID().toString();
        register(new MockHttpSession(), "dup-" + id + "@example.com", PASSWORD, "First")
                .andExpect(status().isCreated());

        register(new MockHttpSession(), "DUP-" + id + "@EXAMPLE.com", PASSWORD, "Second")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("An account with this email already exists."));

        assertThat(userAccountRepository.findByEmail("dup-" + id + "@example.com"))
                .map(UserAccount::getDisplayName)
                .contains("First");
    }

    @Test
    void rejectsInvalidInputWithoutEchoingIt() throws Exception {
        register(new MockHttpSession(), "not-an-email", "tiny-pass", "A")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists())
                .andExpect(jsonPath("$.errors.displayName").exists())
                .andExpect(content().string(not(containsString("tiny-pass"))));
    }

    @Test
    void rejectsPasswordLongerThan128Characters() throws Exception {
        register(new MockHttpSession(), uniqueEmail(), "x".repeat(129), "Long")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    void meRequiresSignIn() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registerWithoutCsrfTokenIsForbidden() throws Exception {
        String email = uniqueEmail();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(email, PASSWORD, "NoToken")))
                .andExpect(status().isForbidden());

        assertThat(userAccountRepository.findByEmail(email)).isEmpty();
    }

    @Test
    void registerRotatesSessionIdAndCsrfToken() throws Exception {
        MockHttpSession session = new MockHttpSession();
        Csrf before = fetchCsrf(session);
        String sessionIdBefore = session.getId();

        mockMvc.perform(post("/api/auth/register").session(session)
                        .header(before.headerName(), before.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(uniqueEmail(), PASSWORD, "Rotate")))
                .andExpect(status().isCreated());

        // New session id blocks session fixation.
        assertThat(session.getId()).isNotEqualTo(sessionIdBefore);

        // The pre-sign-in CSRF token no longer works.
        mockMvc.perform(post("/api/auth/register").session(session)
                        .header(before.headerName(), before.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(uniqueEmail(), PASSWORD, "Stale")))
                .andExpect(status().isForbidden());
    }

    private ResultActions register(MockHttpSession session, String email, String password, String displayName)
            throws Exception {
        Csrf csrf = fetchCsrf(session);
        return mockMvc.perform(post("/api/auth/register").session(session)
                .header(csrf.headerName(), csrf.token())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(email, password, displayName)));
    }

    private Csrf fetchCsrf(MockHttpSession session) throws Exception {
        String json = mockMvc.perform(get("/api/auth/csrf").session(session))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode node = objectMapper.readTree(json);
        return new Csrf(node.get("headerName").asText(), node.get("token").asText());
    }

    private String body(String email, String password, String displayName) throws Exception {
        return objectMapper.writeValueAsString(
                Map.of("email", email, "password", password, "displayName", displayName));
    }

    private static String uniqueEmail() {
        return "user-" + UUID.randomUUID() + "@example.com";
    }

    private record Csrf(String headerName, String token) {
    }
}
