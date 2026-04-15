package com.unleashed.repo;

import com.unleashed.entity.SaleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SaleTypeRepository extends JpaRepository<SaleType, Integer> {
    Optional<SaleType> findBySaleTypeName(String saleTypeName);
}