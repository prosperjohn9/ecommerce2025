package com.example.shop.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** An order ("Order" is a reserved word in JPQL and SQL, hence the name). */
@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Always the signed-in user's id; never taken from the request body.
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Embedded
    private ShippingAddress shipping;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<OrderItem> items = new ArrayList<>();

    public CustomerOrder(Long userId, PaymentMethod paymentMethod, ShippingAddress shipping, Instant createdAt) {
        this.userId = userId;
        this.paymentMethod = paymentMethod;
        this.shipping = shipping;
        this.createdAt = createdAt;
        this.total = BigDecimal.ZERO.setScale(2);
    }

    /** Adds a line priced from the catalogue and keeps the total in step. */
    public void addItem(Product product, int quantity) {
        OrderItem item = new OrderItem(this, product, quantity);
        items.add(item);
        total = total.add(item.getLineTotal());
    }
}
