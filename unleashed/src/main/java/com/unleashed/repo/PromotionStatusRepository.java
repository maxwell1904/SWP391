package com.unleashed.repo;

import com.unleashed.entity.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionStatusRepository extends JpaRepository<PromotionStatus, Integer> {

}
