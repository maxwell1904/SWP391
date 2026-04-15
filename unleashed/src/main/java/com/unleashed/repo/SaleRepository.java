package com.unleashed.repo;

import com.unleashed.entity.Sale;
import com.unleashed.entity.SaleStatus;
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
public interface SaleRepository extends JpaRepository<Sale, Integer>, JpaSpecificationExecutor<Sale> {
    List<Sale> findAllByOrderByIdDesc();

    @Query("SELECT  s FROM Sale s " +
            "JOIN SaleProduct sp ON s.id = sp.id.saleId " +
            "JOIN Product  p ON p.productId = sp.id.productId " +
            "WHERE sp.id.productId = :productId AND s.saleStatus.id = 2")
    Optional<Sale> findSaleByProductId(@Param("productId") UUID productId);

    /**
     * Finds all sales that are currently INACTIVE, where the start date has passed,
     * but the end date has not. These are candidates for activation.
     */
    List<Sale> findBySaleStatusAndSaleStartDateBeforeAndSaleEndDateAfter(
            SaleStatus inactiveStatus, OffsetDateTime nowForStartDate, OffsetDateTime nowForEndDate);

    /**
     * Finds all sales whose end date has passed but whose status is NOT
     * already set to the provided status ID (i.e., not already expired).
     */
    List<Sale> findAllBySaleEndDateBeforeAndSaleStatusIdNot(OffsetDateTime now, Integer statusId);


}