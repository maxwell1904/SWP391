package com.unleashed.repo;

import com.unleashed.entity.Discount;
import com.unleashed.entity.DiscountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Integer>, JpaSpecificationExecutor<Discount> {


    Optional<Discount> findByDiscountCode(String discountCode);


    // Optional<Discount> findByCode(String code);

//    Page<Discount> findAllByDiscountStatus(DiscountStatus status, Pageable pageable);
//
//    @Query("SELECT d FROM Discount d WHERE " +
//            "(:status IS NULL OR d.discountStatus = :status) AND " +
//            "(:type IS NULL OR d.discountType = :type) AND " +
//            "(:minOrderValue IS NULL OR d.discountMinimumOrderValue <= :minOrderValue)")
//    List<Discount> filterDiscounts(@Param("status") DiscountStatus status,
//                                   @Param("type") DiscountType type,
//                                   @Param("minOrderValue") Double minOrderValue,
//                                   Pageable pageable);
//
//    @Query("SELECT d, ud.isDiscountUsed FROM Discount d " +
//            "LEFT JOIN UserDiscount ud ON d.id = ud.id.discountId " +
//            "WHERE ud.id.userId = :userId")
//    List<Object[]> findDiscountsWithUsageCountByUserId(@Param("userId") String userId);

    /**
     * Finds INACTIVE discounts that are within their valid date range and have not reached their usage limit.
     * These are candidates to be activated.
     */
    List<Discount> findByDiscountStatusAndDiscountStartDateBeforeAndDiscountEndDateAfter(
            DiscountStatus inactiveStatus, OffsetDateTime nowForStart, OffsetDateTime nowForEnd);

    /**
     * Finds ACTIVE discounts that have reached their usage limit.
     * These should be made INACTIVE.
     */
    List<Discount> findByDiscountStatusAndDiscountUsageCountGreaterThanEqual(
            DiscountStatus activeStatus, Integer usageLimit);


    /**
     * Finds discounts (regardless of current status) whose end date has passed
     * but are not yet marked as EXPIRED.
     */
    List<Discount> findAllByDiscountEndDateBeforeAndDiscountStatusNot(
            OffsetDateTime now, DiscountStatus expiredStatus);

    /**
     * Finds all Discount entities that are associated with the given DiscountStatus.
     * Spring Data JPA automatically implements this method based on its name.
     * "findBy" - The query prefix.
     * "DiscountStatus" - The property name in the Discount entity.
     *
     * @param discountStatus The DiscountStatus entity to search for.
     * @return A list of discounts matching the given status.
     */
    List<Discount> findByDiscountStatus(DiscountStatus discountStatus);

}