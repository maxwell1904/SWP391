package com.unleashed.repo;

import com.unleashed.entity.composite.PromotionProductId;
import com.unleashed.entity.PromotionProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface PromotionProductRepository extends JpaRepository<PromotionProduct, PromotionProductId> {
    @Modifying
    @Transactional
    @Query("DELETE FROM PromotionProduct sp WHERE sp.id.promotionId = :promotionId")
    void deleteByPromotionId(@Param("promotionId") Integer promotionId);

    List<PromotionProduct> findByIdPromotionId(Integer promotionId);

    @Query("SELECT sp FROM PromotionProduct sp join Promotion s on sp.id.promotionId = s.id where sp.id.productId = :productId AND s.promotionStatus.promotionStatusName = 'ACTIVE' ")
    PromotionProduct findPromotionProductByProductId(@Param("productId") UUID productId);

    @Query("SELECT p.productId FROM Promotion s JOIN PromotionProduct sp ON s.id = sp.id.promotionId JOIN Product p ON sp.id.productId = p.productId")
    List<Object[]> getAllProductsInPromotions();

    List<PromotionProduct> findById_ProductId(UUID idProductId);

    @Query("SELECT s.id.productId FROM PromotionProduct s")
    List<UUID> findAllProductIdsInPromotion();

    @Query("SELECT sp FROM PromotionProduct sp JOIN Promotion s on sp.id.promotionId = s.id WHERE sp.id.productId IN :productIds AND s.promotionStatus.promotionStatusName = 'ACTIVE'")
    List<PromotionProduct> findPromotionProductsByProductIds(@Param("productIds") List<UUID> productIds);

}