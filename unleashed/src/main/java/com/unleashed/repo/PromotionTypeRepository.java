package com.unleashed.repo;

import com.unleashed.entity.PromotionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PromotionTypeRepository extends JpaRepository<PromotionType, Integer> {
    Optional<PromotionType> findByPromotionTypeName(String promotionTypeName);
}