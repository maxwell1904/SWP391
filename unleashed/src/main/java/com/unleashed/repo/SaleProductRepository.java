package com.unleashed.repo;

import com.unleashed.entity.composite.SaleProductId;
import com.unleashed.entity.SaleProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface SaleProductRepository extends JpaRepository<SaleProduct, SaleProductId> {
    @Modifying
    @Transactional
    @Query("DELETE FROM SaleProduct sp WHERE sp.id.saleId = :saleId")
    void deleteBySaleId(@Param("saleId") Integer saleId);

    List<SaleProduct> findByIdSaleId(Integer saleId);

    @Query("SELECT sp FROM SaleProduct sp join Sale s on sp.id.saleId = s.id where sp.id.productId = :productId AND s.saleStatus.saleStatusName = 'ACTIVE' ")
    SaleProduct findSaleProductByProductId(@Param("productId") UUID productId);

    @Query("SELECT p.productId FROM Sale s JOIN SaleProduct sp ON s.id = sp.id.saleId JOIN Product p ON sp.id.productId = p.productId")
    List<Object[]> getAllProductsInSales();

    List<SaleProduct> findById_ProductId(UUID idProductId);

    @Query("SELECT s.id.productId FROM SaleProduct s")
    List<UUID> findAllProductIdsInSale();

    @Query("SELECT sp FROM SaleProduct sp JOIN Sale s on sp.id.saleId = s.id WHERE sp.id.productId IN :productIds AND s.saleStatus.saleStatusName = 'ACTIVE'")
    List<SaleProduct> findSaleProductsByProductIds(@Param("productIds") List<UUID> productIds);

}