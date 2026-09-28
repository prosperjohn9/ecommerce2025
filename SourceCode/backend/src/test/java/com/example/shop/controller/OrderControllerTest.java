package com.example.shop.controller;

import com.example.shop.dto.RegisterRequest;
import com.example.shop.model.UserAccount;
import com.example.shop.repository.CustomerOrderRepository;
import com.example.shop.security.ShopUserDetails;
import com.example.shop.service.AccountService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Orders are priced by the server and visible only to their owner.
 * Seed prices (V2__seed_products.sql): product 1 = 89.99, product 6 = 69.99.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderControllerTest {

    private static final String SHIPPING = """
            {"fullName":"Ada Lovelace","phone":"+44 20 7946 0000","address":"12 St James's Square",\
            "city":"London","country":"UK"}""";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccountService accountService;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Test
    void placeOrderComputesTotalFromDatabasePrices() throws Exception {
        ShopUserDetails ada = newUser("Ada");

        placeOrder(ada, order("""
                [{"productId":1,"quantity":2},{"productId":6,"quantity":1}]"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.paymentMethod").value("CARD"))
                .andExpect(jsonPath("$.shipping.fullName").value("Ada Lovelace"))
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].productId").value(1))
                .andExpect(jsonPath("$.items[0].productName").value("Longchamp Bags (Black)"))
                .andExpect(jsonPath("$.items[0].unitPrice").value(89.99))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.items[0].lineTotal").value(179.98))
                .andExpect(jsonPath("$.items[1].unitPrice").value(69.99))
                .andExpect(jsonPath("$.items[1].lineTotal").value(69.99))
                .andExpect(jsonPath("$.total").value(249.97));

        assertThat(customerOrderRepository.findByUserIdOrderByCreatedAtDescIdDesc(ada.getId())).hasSize(1);
    }

    @Test
    void rejectsAPriceSentByTheClient() throws Exception {
        ShopUserDetails mallory = newUser("Mallory");

        placeOrder(mallory, order("""
                [{"productId":1,"quantity":1,"price":0.01}]"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unknown field: items[0].price"));

        assertThat(customerOrderRepository.findByUserIdOrderByCreatedAtDescIdDesc(mallory.getId())).isEmpty();
    }

    @Test
    void rejectsATotalSentByTheClient() throws Exception {
        ShopUserDetails mallory = newUser("Mallory");

        placeOrder(mallory, """
                {"items":[{"productId":1,"quantity":1}],"shipping":%s,"paymentMethod":"CARD","total":0.01}"""
                .formatted(SHIPPING))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unknown field: total"));

        assertThat(customerOrderRepository.findByUserIdOrderByCreatedAtDescIdDesc(mallory.getId())).isEmpty();
    }

    @Test
    void cannotPlaceAnOrderForAnotherUser() throws Exception {
        ShopUserDetails mallory = newUser("Mallory");
        ShopUserDetails victim = newUser("Victim");

        placeOrder(mallory, """
                {"items":[{"productId":1,"quantity":1}],"shipping":%s,"paymentMethod":"CARD","userId":%d}"""
                .formatted(SHIPPING, victim.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unknown field: userId"));

        assertThat(customerOrderRepository.findByUserIdOrderByCreatedAtDescIdDesc(victim.getId())).isEmpty();
    }

    @Test
    void usersSeeOnlyTheirOwnOrdersNewestFirst() throws Exception {
        ShopUserDetails alice = newUser("Alice");
        ShopUserDetails bob = newUser("Bob");
        long aliceFirst = placedOrderId(alice, "[{\"productId\":1,\"quantity\":1}]");
        long aliceSecond = placedOrderId(alice, "[{\"productId\":2,\"quantity\":1}]");
        long bobOnly = placedOrderId(bob, "[{\"productId\":3,\"quantity\":1}]");

        assertThat(orderIdsFor(alice)).containsExactly(aliceSecond, aliceFirst);
        assertThat(orderIdsFor(bob)).containsExactly(bobOnly);
    }

    @Test
    void newUserHasNoOrders() throws Exception {
        mockMvc.perform(get("/api/orders").with(user(newUser("Fresh"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void ordersRequireSignIn() throws Exception {
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/orders").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(order("[{\"productId\":1,\"quantity\":1}]")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void placeOrderWithoutCsrfTokenIsForbidden() throws Exception {
        ShopUserDetails ada = newUser("Ada");

        mockMvc.perform(post("/api/orders").with(user(ada))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(order("[{\"productId\":1,\"quantity\":1}]")))
                .andExpect(status().isForbidden());

        assertThat(customerOrderRepository.findByUserIdOrderByCreatedAtDescIdDesc(ada.getId())).isEmpty();
    }

    @Test
    void rejectsUnknownProducts() throws Exception {
        placeOrder(newUser("Ada"), order("[{\"productId\":999999,\"quantity\":1}]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("999999")));
    }

    @Test
    void rejectsTheSameProductTwice() throws Exception {
        placeOrder(newUser("Ada"), order("[{\"productId\":1,\"quantity\":1},{\"productId\":1,\"quantity\":2}]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("more than once")));
    }

    @Test
    void rejectsQuantitiesOutsideOneTo99() throws Exception {
        ShopUserDetails ada = newUser("Ada");

        placeOrder(ada, order("[{\"productId\":1,\"quantity\":0}]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['items[0].quantity']").exists());
        placeOrder(ada, order("[{\"productId\":1,\"quantity\":100}]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['items[0].quantity']").exists());
        placeOrder(ada, order("[{\"productId\":1,\"quantity\":1.5}]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid value for field: items[0].quantity"));
    }

    @Test
    void rejectsEmptyOrdersAndMissingShipping() throws Exception {
        ShopUserDetails ada = newUser("Ada");

        placeOrder(ada, order("[]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.items").exists());
        placeOrder(ada, """
                {"items":[{"productId":1,"quantity":1}],"shipping":{"fullName":" ","phone":"1",\
                "address":"a","city":"c","country":"d"},"paymentMethod":"COD"}""")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['shipping.fullName']").exists());
        placeOrder(ada, """
                {"items":[{"productId":1,"quantity":1}],"paymentMethod":"COD"}""")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.shipping").exists());
    }

    @Test
    void rejectsUnknownPaymentMethods() throws Exception {
        placeOrder(newUser("Ada"), """
                {"items":[{"productId":1,"quantity":1}],"shipping":%s,"paymentMethod":"BITCOIN"}"""
                .formatted(SHIPPING))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid value for field: paymentMethod"));
    }

    private ShopUserDetails newUser(String displayName) {
        UserAccount account = accountService.register(
                new RegisterRequest("user-" + UUID.randomUUID() + "@example.com", "correct horse battery", displayName));
        return new ShopUserDetails(account.getId(), account.getEmail(), null);
    }

    private ResultActions placeOrder(ShopUserDetails shopper, String json) throws Exception {
        return mockMvc.perform(post("/api/orders").with(user(shopper)).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json));
    }

    private long placedOrderId(ShopUserDetails shopper, String items) throws Exception {
        String json = placeOrder(shopper, order(items))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(json).get("id").asLong();
    }

    private List<Long> orderIdsFor(ShopUserDetails shopper) throws Exception {
        String json = mockMvc.perform(get("/api/orders").with(user(shopper)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        List<Long> ids = new ArrayList<>();
        for (JsonNode order : objectMapper.readTree(json)) {
            ids.add(order.get("id").asLong());
        }
        return ids;
    }

    private static String order(String items) {
        return """
                {"items":%s,"shipping":%s,"paymentMethod":"CARD"}""".formatted(items, SHIPPING);
    }
}
