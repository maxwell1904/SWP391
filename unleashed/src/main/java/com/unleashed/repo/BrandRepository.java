package com.unleashed.repo;

import com.unleashed.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Integer> {
    @Query(value = """
                SELECT b.brand_id,
                       b.brand_name,
                       b.brand_description,
                       b.brand_image_url,
                       b.brand_website_url,
                       b.brand_created_at,
                       b.brand_updated_at,
                       COALESCE(SUM(sp.stock_quantity), 0) AS total_quantity
                FROM brand b
                LEFT JOIN product p ON b.brand_id = p.brand_id
                LEFT JOIN variation v ON p.product_id = v.product_id
                LEFT JOIN stock_variation sp ON v.variation_id = sp.variation_id
                GROUP BY b.brand_id,
                         b.brand_name,
                         b.brand_description,
                         b.brand_image_url,
                         b.brand_website_url,
                         b.brand_created_at,
                         b.brand_updated_at
                ORDER BY b.brand_id
            """, nativeQuery = true)
    List<Object[]> findAllBrandsWithQuantity();


    //    @Query("SELECT b.brandName, COALESCE(SUM(od.orderQuantity), 0) AS totalProductsSold " +
//            "FROM Brand b " +
//            "LEFT JOIN Product p ON p.brand.id = b.id " +
//            "LEFT JOIN Variation v ON v.product.productId = p.productId " +
//            "LEFT JOIN Order od ON od. = v.id " +
//            "GROUP BY b.brandId, b.brandName, b.logoUrl")
//    List<Object[]> findTotalProductsSoldPerBrand();
    boolean existsByBrandName(String brandName);

    boolean existsByBrandWebsiteUrl(String brandWebsiteUrl);
}