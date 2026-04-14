package com.unleashed.repo;

import com.unleashed.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<Stock, Integer> {
    @Query(value = """
            WITH StockCTE AS (
                SELECT
                    s.stock_id,
                    s.stock_name,
                    s.stock_address,
                    v.variation_id,
                    v.variation_price,
                    v.variation_image,
                    p.product_name,
                    p.product_id,
                    b.brand_id,
                    b.brand_name,
                    ct.category_id,
                    ct.category_name,
                    sz.size_name,
                    cl.color_name,
                    cl.color_hex_code,
                    sv.stock_quantity,
                    ROW_NUMBER() OVER (PARTITION BY v.variation_id, s.stock_id ORDER BY v.variation_id) as rn
                FROM
                    stock s
                LEFT JOIN stock_variation sv ON s.stock_id = sv.stock_id
                LEFT JOIN variation v ON sv.variation_id = v.variation_id
                LEFT JOIN product p ON v.product_id = p.product_id
                LEFT JOIN brand b ON p.brand_id = b.brand_id
                LEFT JOIN product_category pc ON p.product_id = pc.product_id
                LEFT JOIN category ct ON pc.category_id = ct.category_id
                LEFT JOIN size sz ON v.size_id = sz.size_id
                LEFT JOIN color cl ON v.color_id = cl.color_id
                WHERE s.stock_id = :stockId
            )
            SELECT
                stock_id,
                stock_name,
                stock_address,
                variation_id,
                variation_price,
                variation_image,
                product_name,
                product_id,
                brand_id,
                brand_name,
                category_id,
                category_name,
                size_name,
                color_name,
                color_hex_code,
                stock_quantity
            FROM StockCTE
            WHERE rn = 1
            """, nativeQuery = true)
    List<Object[]> findStockDetailsById(@Param("stockId") Integer stockId);
}