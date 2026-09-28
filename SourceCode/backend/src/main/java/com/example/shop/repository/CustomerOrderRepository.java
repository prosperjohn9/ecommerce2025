package com.example.shop.repository;

import com.example.shop.model.CustomerOrder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    // Callers pass the signed-in user's id. Items are loaded in the same query.
    @EntityGraph(attributePaths = "items")
    List<CustomerOrder> findByUserIdOrderByCreatedAtDescIdDesc(Long userId);
}
