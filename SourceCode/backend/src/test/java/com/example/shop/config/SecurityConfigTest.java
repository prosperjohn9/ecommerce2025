package com.example.shop.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** CORS, default-deny and response headers. The test profile allows http://localhost:3000. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigTest {

    private static final String FRONTEND = "http://localhost:3000";
    private static final String OTHER_SITE = "https://evil.example";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void allowsPreflightFromFrontendOrigin() throws Exception {
        mockMvc.perform(options("/api/auth/register")
                        .header("Origin", FRONTEND)
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type,x-csrf-token"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", FRONTEND))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"))
                .andExpect(header().string("Access-Control-Allow-Methods", containsString("POST")));
    }

    @Test
    void rejectsPreflightFromOtherOrigin() throws Exception {
        mockMvc.perform(options("/api/auth/register")
                        .header("Origin", OTHER_SITE)
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void allowsCrossOriginReadFromFrontendOrigin() throws Exception {
        mockMvc.perform(get("/api/products/1").header("Origin", FRONTEND))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", FRONTEND))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    void rejectsCrossOriginReadFromOtherOrigin() throws Exception {
        mockMvc.perform(get("/api/products/1").header("Origin", OTHER_SITE))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void unlistedEndpointsRequireSignIn() throws Exception {
        mockMvc.perform(get("/api/not-a-real-endpoint"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void setsSecurityHeaders() throws Exception {
        mockMvc.perform(get("/api/products/1"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Cache-Control", containsString("no-store")));
    }
}
