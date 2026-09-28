package com.example.shop.dto;

import com.example.shop.model.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Checkout form. The client says what it wants, never what it costs or whose order it is:
 * prices come from the database and the owner is the signed-in user. Unknown fields such as
 * "price", "total" or "userId" are rejected (spring.jackson.deserialization.fail-on-unknown-properties).
 */
public record PlaceOrderRequest(
        @NotEmpty @Size(max = 50) List<@NotNull @Valid OrderLineRequest> items,
        @NotNull @Valid ShippingDetails shipping,
        @NotNull PaymentMethod paymentMethod) {
}
