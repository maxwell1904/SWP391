package com.unleashed.repo;

import com.unleashed.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;


@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    @Query(value = """
                SELECT c.category_id,
                       c.category_name,
                       c.category_description,
                       c.category_image_url,
                       c.category_created_at,
                       c.category_updated_at,
                       COALESCE(SUM(sv.stock_quantity), 0) AS total_quantity
                FROM category c
                LEFT JOIN product_category pc ON c.category_id = pc.category_id
                LEFT JOIN product p ON pc.product_id = p.product_id
                LEFT JOIN variation v ON p.product_id = v.product_id
                LEFT JOIN stock_variation sv ON v.variation_id = sv.variation_id
                GROUP BY c.category_id,
                         c.category_name, 
                         c.category_description,
                         c.category_image_url,
                         c.category_created_at,
                         c.category_updated_at
                ORDER BY c.category_id
            """, nativeQuery = true)
    List<Object[]> findAllCategoriesWithQuantity();

    @Query(value = "SELECT c FROM Category c " +
            "JOIN ProductCategory pc ON c.id = pc.id.categoryId " +
            "JOIN Product p ON p.productId = pc.id.productId " +
            "WHERE p.productId = :productId")
    List<Category> findCategoriesByProductId(@Param("productId") UUID productId);

    boolean existsByCategoryName(String categoryName);
}