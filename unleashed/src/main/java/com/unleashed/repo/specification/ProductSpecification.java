package com.unleashed.repo.specification;

import com.unleashed.entity.Product;
import com.unleashed.entity.PromotionProduct;
import com.unleashed.entity.StockVariation;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class ProductSpecification {

    public static Specification<Product> hasNameLike(String searchTerm) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(searchTerm)) {
                return cb.conjunction();
            }
            return cb.like(cb.lower(root.get("productName")), "%" + searchTerm.toLowerCase() + "%");
        };
    }

    public static Specification<Product> notInProductIds(List<String> productIds) {
        return (root, query, cb) -> {
            if (productIds == null || productIds.isEmpty()) {
                return cb.conjunction(); // Find all products if the exclusion list is empty
            }

            // Convert the list of Strings to a list of UUIDs
            List<UUID> productUuids = productIds.stream()
                    .map(UUID::fromString)
                    .collect(Collectors.toList());

            // Use the correctly typed list in the 'in' clause
            return root.get("productId").in(productUuids).not();
        };
    }

    // --- THIS METHOD IS NOW FIXED ---
    public static Specification<Product> inProductIds(List<String> productIds) {
        return (root, query, cb) -> {
            if (productIds == null || productIds.isEmpty()) {
                return cb.disjunction(); // Find no products if the inclusion list is empty
            }

            // Convert the list of Strings to a list of UUIDs
            List<UUID> productUuids = productIds.stream()
                    .map(UUID::fromString)
                    .collect(Collectors.toList());

            // Use the correctly typed list in the 'in' clause
            return root.get("productId").in(productUuids);
        };
    }

    public static Specification<Product> hasStock() {
        return (root, query, cb) -> {
            // Create a subquery to calculate the sum of stock for a product
            Subquery<Long> stockSubquery = query.subquery(Long.class);
            Root<StockVariation> stockVariationRoot = stockSubquery.from(StockVariation.class);

            // Link the subquery to the main query on product_id
            stockSubquery.where(cb.equal(stockVariationRoot.get("variation").get("product").get("productId"), root.get("productId")));

            // Select the sum of stockQuantity
            stockSubquery.select(cb.sum(stockVariationRoot.get("stockQuantity")));

            // The main predicate: ensure the sum of stock is greater than 0
            return cb.greaterThan(stockSubquery, 0L);
        };
    }

    /**
     * Creates a specification to find products that are not associated with any promotion.
     * It uses a subquery to get all product IDs from the PromotionProduct entity
     * and then filters for products whose IDs are NOT IN that result set.
     */
    public static Specification<Product> isNotInAnyPromotion() {
        return (root, query, cb) -> {
            // 1. Create the subquery that will select from PromotionProduct
            Subquery<UUID> promotionProductSubquery = query.subquery(UUID.class);
            Root<PromotionProduct> promotionProductRoot = promotionProductSubquery.from(PromotionProduct.class);

            // 2. Select the product IDs from the PromotionProduct table
            //    Assumes PromotionProduct has a composite key 'id' which contains 'productId'
            promotionProductSubquery.select(promotionProductRoot.get("id").get("productId"));

            // 3. The main predicate: Product's ID must not be in the subquery's results
            return root.get("productId").in(promotionProductSubquery).not();
        };
    }


}