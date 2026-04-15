package com.unleashed.repo.specification;

import com.unleashed.entity.*;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

public class StockVariationSpecification implements Specification<StockVariation> {

    private final Integer stockId;
    private final String searchTerm;
    private final Integer brandId;
    private final Integer categoryId;
    private final boolean isLowStockOnly;

    public StockVariationSpecification(Integer stockId, String searchTerm, Integer brandId, Integer categoryId, boolean isLowStockOnly) {
        this.stockId = stockId;
        this.searchTerm = searchTerm;
        this.brandId = brandId;
        this.categoryId = categoryId;
        this.isLowStockOnly = isLowStockOnly;
    }

    @Override
    public Predicate toPredicate(Root<StockVariation> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        List<Predicate> predicates = new ArrayList<>();

        predicates.add(cb.equal(root.get("id").get("stockId"), stockId));

        if (isLowStockOnly) {
            predicates.add(cb.lessThan(root.get("stockQuantity"), 10));
        }

        Join<StockVariation, Variation> variationJoin = root.join("variation", JoinType.LEFT);
        Join<Variation, Product> productJoin = variationJoin.join("product", JoinType.LEFT);

        if (brandId != null) {
            predicates.add(cb.equal(productJoin.get("brand").get("id"), brandId));
        }

        if (categoryId != null) {
            Join<Product, Category> categoryJoin = productJoin.join("categories", JoinType.LEFT);
            predicates.add(cb.equal(categoryJoin.get("id"), categoryId));
            query.distinct(true);
        }

        if (StringUtils.hasText(searchTerm)) {
            String likePattern = "%" + searchTerm.toLowerCase() + "%";

            List<Predicate> searchPredicates = new ArrayList<>();
            searchPredicates.add(cb.like(cb.lower(productJoin.get("productName")), likePattern));
            searchPredicates.add(cb.like(cb.lower(variationJoin.get("color").get("colorName")), likePattern));
            searchPredicates.add(cb.like(cb.lower(variationJoin.get("size").get("sizeName")), likePattern));

            predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
        }

        // query.distinct(true);

        return cb.and(predicates.toArray(new Predicate[0]));
    }
}