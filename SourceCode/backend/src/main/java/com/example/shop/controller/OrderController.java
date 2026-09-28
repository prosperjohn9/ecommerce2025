package com.example.shop.controller;

import com.example.shop.dto.OrderResponse;
import com.example.shop.dto.PlaceOrderRequest;
import com.example.shop.security.ShopUserDetails;
import com.example.shop.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Signed-in users only (SecurityConfig). The owner is always taken from the session.
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // POST /api/orders
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse placeOrder(@AuthenticationPrincipal ShopUserDetails user,
                                    @Valid @RequestBody PlaceOrderRequest request) {
        return OrderResponse.from(orderService.placeOrder(user.getId(), request));
    }

    // GET /api/orders
    // Only the caller's orders, newest first.
    @GetMapping
    public List<OrderResponse> myOrders(@AuthenticationPrincipal ShopUserDetails user) {
        return orderService.ordersFor(user.getId()).stream()
                .map(OrderResponse::from)
                .toList();
    }
}
