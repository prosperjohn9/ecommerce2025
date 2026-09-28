package com.example.shop.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** One cart line as the client sends it: which product and how many. There is no price field on purpose. */
public record OrderLineRequest(
        @NotNull @Positive Long productId,
        @NotNull @Min(1) @Max(99) Integer quantity) {
}
