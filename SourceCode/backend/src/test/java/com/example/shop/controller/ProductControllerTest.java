package com.example.shop.controller;

import com.example.shop.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerTest {

    // Row counts from db/migration/V2__seed_products.sql
    private static final int SEEDED_PRODUCTS = 76;
    private static final int SEEDED_BAGS = 30;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void seedMigrationLoadsEachProductOnce() {
        assertThat(productRepository.count()).isEqualTo(SEEDED_PRODUCTS);
    }

    @Test
    void listsAllProducts() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(SEEDED_PRODUCTS));
    }

    @Test
    void filtersByCategoryIgnoringCase() throws Exception {
        mockMvc.perform(get("/api/products").param("category", "bag"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(SEEDED_BAGS))
                .andExpect(jsonPath("$[*].category", everyItem(is("BAG"))));
    }

    @Test
    void returnsOneProductById() throws Exception {
        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Longchamp Bags (Black)"))
                .andExpect(jsonPath("$.price").value(89.99));
    }

    @Test
    void returns404ForUnknownProduct() throws Exception {
        mockMvc.perform(get("/api/products/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Product not found with id 999999"));
    }
}
