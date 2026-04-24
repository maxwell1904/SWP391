package com.unleashed.repo;

import com.unleashed.entity.Promotion;
import com.unleashed.entity.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer>, JpaSpecificationExecutor<Promotion> {
    List<Promotion> findAllByOrderByIdDesc();

    @Query("SELECT  s FROM Promotion s " +
            "JOIN PromotionProduct sp ON s.id = sp.id.promotionId " +
            "JOIN Product  p ON p.productId = sp.id.productId " +
            "WHERE sp.id.productId = :productId AND s.promotionStatus.id = 2")
    Optional<Promotion> findPromotionByProductId(@Param("productId") UUID productId);

    /**
     * Finds all promotions that are currently INACTIVE, where the start date has passed,
     * but the end date has not. These are candidates for activation.
     */
    List<Promotion> findByPromotionStatusAndPromotionStartDateBeforeAndPromotionEndDateAfter(
            PromotionStatus inactiveStatus, OffsetDateTime nowForStartDate, OffsetDateTime nowForEndDate);

    /**
     * Finds all promotions whose end date has passed but whose status is NOT
     * already set to the provided status ID (i.e., not already expired).
     */
    List<Promotion> findAllByPromotionEndDateBeforeAndPromotionStatusIdNot(OffsetDateTime now, Integer statusId);


}