package com.example.shop.dto;

import com.example.shop.model.OrderItem;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId,
        String productName,
        String imageUrl,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal lineTotal) {

    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(item.getProductId(), item.getProductName(), item.getImageUrl(),
                item.getUnitPrice(), item.getQuantity(), item.getLineTotal());
    }
}
