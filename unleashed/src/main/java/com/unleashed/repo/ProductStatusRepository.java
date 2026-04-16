package com.unleashed.repo;

import com.unleashed.entity.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductStatusRepository extends JpaRepository<ProductStatus, Integer> {

    @Query("SELECT p.productStatus.id FROM Product p WHERE p.productId = :productId")
    Integer findStatusByProductId(@Param("productId") UUID productId);
}