package com.example.shop.service;

import com.example.shop.dto.OrderLineRequest;
import com.example.shop.dto.PlaceOrderRequest;
import com.example.shop.exception.InvalidOrderException;
import com.example.shop.model.CustomerOrder;
import com.example.shop.model.Product;
import com.example.shop.repository.CustomerOrderRepository;
import com.example.shop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final CustomerOrderRepository customerOrderRepository;
    private final ProductRepository productRepository;

    public OrderService(CustomerOrderRepository customerOrderRepository, ProductRepository productRepository) {
        this.customerOrderRepository = customerOrderRepository;
        this.productRepository = productRepository;
    }

    /** Places an order for userId. Every price comes from the product table, never from the request. */
    @Transactional
    public CustomerOrder placeOrder(Long userId, PlaceOrderRequest request) {
        Map<Long, Integer> quantities = new LinkedHashMap<>();
        for (OrderLineRequest line : request.items()) {
            if (quantities.putIfAbsent(line.productId(), line.quantity()) != null) {
                throw new InvalidOrderException("Product " + line.productId() + " appears more than once.");
            }
        }

        Map<Long, Product> products = productRepository.findAllById(quantities.keySet()).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
        List<Long> unknown = quantities.keySet().stream().filter(id -> !products.containsKey(id)).toList();
        if (!unknown.isEmpty()) {
            throw new InvalidOrderException("Unknown product id(s): " + unknown);
        }

        CustomerOrder order = new CustomerOrder(
                userId, request.paymentMethod(), request.shipping().toAddress(), Instant.now());
        quantities.forEach((productId, quantity) -> order.addItem(products.get(productId), quantity));
        return customerOrderRepository.save(order);
    }

    /** The given user's orders, newest first. */
    @Transactional(readOnly = true)
    public List<CustomerOrder> ordersFor(Long userId) {
        return customerOrderRepository.findByUserIdOrderByCreatedAtDescIdDesc(userId);
    }
}
