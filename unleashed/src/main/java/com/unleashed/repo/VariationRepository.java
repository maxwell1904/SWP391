package com.unleashed.repo;

import com.unleashed.entity.Variation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VariationRepository extends JpaRepository<Variation, Integer>, JpaSpecificationExecutor<Variation> {
    @Query("""
        SELECT v 
        FROM Variation v 
        LEFT JOIN StockVariation sv ON sv.id.variationId = v.id 
        WHERE v.product.productId = :productId 
          AND (sv.stockQuantity IS NULL OR sv.stockQuantity <> -1)
    """)
    List<Variation> findProductVariationByProductId(@Param("productId") UUID productId);

    Optional<Variation> findByProduct_ProductCodeAndColor_ColorNameAndSize_SizeName(String productCode, String colorName, String sizeName);

    @Query("SELECT v.product.productId FROM Variation v WHERE v.id = :variationId")
    UUID findProductIdByVariationId(@Param("variationId") int variationId);

    @Query("SELECT v FROM Variation v WHERE v.product.productId IN :productIds")
    List<Variation> findProductVariationsByProductIds(@Param("productIds") List<UUID> productIds);

    @Query("SELECT v.product.productId FROM Variation v WHERE v.id IN :variationIds")
    List<UUID> findProductIdsByVariationIds(@Param("variationIds") List<Integer> variationIds);

}