package com.unleashed.repo;

import com.unleashed.entity.DiscountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscountTypeRepository extends JpaRepository<DiscountType, Integer> {
}
