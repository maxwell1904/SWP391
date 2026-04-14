package com.unleashed.repo;

import com.unleashed.entity.DiscountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscountStatusRespository extends JpaRepository<DiscountStatus, Integer> {
    DiscountStatus getDiscountStatusById(Integer id);

    DiscountStatus findByDiscountStatusName(String discountStatusName);
}
