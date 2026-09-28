package com.example.shop.dto;

import com.example.shop.model.CustomerOrder;
import com.example.shop.model.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        Instant createdAt,
        PaymentMethod paymentMethod,
        ShippingDetails shipping,
        List<OrderItemResponse> items,
        BigDecimal total) {

    public static OrderResponse from(CustomerOrder order) {
        return new OrderResponse(
                order.getId(),
                order.getCreatedAt(),
                order.getPaymentMethod(),
                ShippingDetails.from(order.getShipping()),
                order.getItems().stream().map(OrderItemResponse::from).toList(),
                order.getTotal());
    }
}
