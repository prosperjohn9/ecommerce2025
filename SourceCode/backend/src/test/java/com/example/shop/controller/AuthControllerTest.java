package com.example.shop.controller;

import com.example.shop.dto.RegisterRequest;
import com.example.shop.model.UserAccount;
import com.example.shop.repository.UserAccountRepository;
import com.example.shop.service.AccountService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.emptyString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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

    @Autowired
    private AccountService accountService;

    // Each test gets its own client IP so the per-IP login limit never leaks between tests.
    private final String clientIp = "10." + ThreadLocalRandom.current().nextInt(256)
            + "." + ThreadLocalRandom.current().nextInt(256)
            + "." + ThreadLocalRandom.current().nextInt(256);

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

    // ---- Login and logout ----

    @Test
    void loginWithCorrectPasswordStartsSession() throws Exception {
        String email = createAccount("Grace");
        MockHttpSession session = new MockHttpSession();

        login(session, "  " + email.toUpperCase(Locale.ROOT) + " ", PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.displayName").value("Grace"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void wrongPasswordAndUnknownEmailGetTheSameAnswer() throws Exception {
        String email = createAccount("Known");

        String wrongPassword = login(new MockHttpSession(), email, "not the right password")
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();
        String unknownEmail = login(new MockHttpSession(), uniqueEmail(), PASSWORD)
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();

        assertThat(objectMapper.readTree(wrongPassword).get("message").asText())
                .isEqualTo("Invalid email or password.");
        assertThat(withoutTimestamp(wrongPassword)).isEqualTo(withoutTimestamp(unknownEmail));
    }

    @Test
    void loginRotatesSessionIdAndCsrfToken() throws Exception {
        String email = createAccount("Rotator");
        MockHttpSession session = new MockHttpSession();
        Csrf before = fetchCsrf(session);
        String sessionIdBefore = session.getId();

        mockMvc.perform(post("/api/auth/login").session(session)
                        .with(fromIp(clientIp))
                        .header(before.headerName(), before.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(email, PASSWORD)))
                .andExpect(status().isOk());

        assertThat(session.getId()).isNotEqualTo(sessionIdBefore);
        mockMvc.perform(post("/api/auth/logout").session(session)
                        .header(before.headerName(), before.token()))
                .andExpect(status().isForbidden());
    }

    @Test
    void loginWithoutCsrfTokenIsForbidden() throws Exception {
        String email = createAccount("NoToken");
        MockHttpSession session = new MockHttpSession();

        mockMvc.perform(post("/api/auth/login").session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(email, PASSWORD)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginRejectsBlankFields() throws Exception {
        login(new MockHttpSession(), " ", "")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    void logoutEndsTheSessionAndClearsTheCookie() throws Exception {
        String email = createAccount("Leaver");
        MockHttpSession session = new MockHttpSession();
        login(session, email, PASSWORD).andExpect(status().isOk());
        Csrf csrf = fetchCsrf(session);

        mockMvc.perform(post("/api/auth/logout").session(session)
                        .header(csrf.headerName(), csrf.token()))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge("JSESSIONID", 0));

        assertThat(session.isInvalid()).isTrue();
        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logoutWithoutCsrfTokenIsForbidden() throws Exception {
        String email = createAccount("Stayer");
        MockHttpSession session = new MockHttpSession();
        login(session, email, PASSWORD).andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk());
    }

    // ---- Login rate limit: 5 failures per email, 20 per IP, per 15 minutes ----

    @Test
    void blocksAnEmailAfterFiveFailedAttempts() throws Exception {
        String email = createAccount("Target");
        for (int i = 0; i < 5; i++) {
            login(new MockHttpSession(), email, "wrong password " + i).andExpect(status().isUnauthorized());
        }

        // Even the right password is refused while the email is blocked.
        login(new MockHttpSession(), email, PASSWORD)
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.message").value("Too many failed sign-in attempts. Try again later."));
    }

    @Test
    void unknownEmailsAreBlockedTheSameWay() throws Exception {
        String unknown = uniqueEmail();
        for (int i = 0; i < 5; i++) {
            login(new MockHttpSession(), unknown, "wrong password " + i).andExpect(status().isUnauthorized());
        }

        login(new MockHttpSession(), unknown, PASSWORD)
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void blocksAnIpAfterTwentyFailedAttempts() throws Exception {
        String email = createAccount("Neighbour");
        for (int i = 0; i < 20; i++) {
            login(new MockHttpSession(), uniqueEmail(), "guess " + i).andExpect(status().isUnauthorized());
        }

        login(new MockHttpSession(), email, PASSWORD)
                .andExpect(status().isTooManyRequests());
        login(new MockHttpSession(), email, PASSWORD, "10.255.255.254")
                .andExpect(status().isOk());
    }

    private ResultActions login(MockHttpSession session, String email, String password) throws Exception {
        return login(session, email, password, clientIp);
    }

    private ResultActions login(MockHttpSession session, String email, String password, String ip)
            throws Exception {
        Csrf csrf = fetchCsrf(session);
        return mockMvc.perform(post("/api/auth/login").session(session)
                .with(fromIp(ip))
                .header(csrf.headerName(), csrf.token())
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody(email, password)));
    }

    private String loginBody(String email, String password) throws Exception {
        return objectMapper.writeValueAsString(Map.of("email", email, "password", password));
    }

    private static RequestPostProcessor fromIp(String ip) {
        return request -> {
            request.setRemoteAddr(ip);
            return request;
        };
    }

    private String createAccount(String displayName) {
        String email = uniqueEmail();
        accountService.register(new RegisterRequest(email, PASSWORD, displayName));
        return email;
    }

    private JsonNode withoutTimestamp(String json) throws Exception {
        ObjectNode node = (ObjectNode) objectMapper.readTree(json);
        node.remove("timestamp");
        return node;
    }

    // ---- Helpers ----

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
