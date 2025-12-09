package com.example.shop.repository;

import com.example.shop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // For /api/products?category=BAG or /api/products?category=SHOE
    List<Product> findByCategoryIgnoreCase(String category);
}