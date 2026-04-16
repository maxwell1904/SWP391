package com.unleashed.repo.specification;

import com.unleashed.entity.*;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class VariationSpecification implements Specification<Variation> {

    private final String searchTerm;
    private final Integer stockId;

    public VariationSpecification(String searchTerm, Integer stockId) {
        this.searchTerm = searchTerm;
        this.stockId = stockId;
    }

    @Override
    public Predicate toPredicate(Root<Variation> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        Join<Variation, Product> productJoin = root.join("product", JoinType.LEFT);

        List<Predicate> mainPredicates = new ArrayList<>();

        mainPredicates.add(cb.isNotNull(productJoin.get("productStatus")));

        if (StringUtils.hasText(searchTerm)) {
            String likePattern = "%" + searchTerm.toLowerCase() + "%";
            Join<Product, Brand> brandJoin = productJoin.join("brand", JoinType.LEFT);
            Join<Variation, Size> sizeJoin = root.join("size", JoinType.LEFT);
            Join<Variation, Color> colorJoin = root.join("color", JoinType.LEFT);

            List<Predicate> searchPredicates = new ArrayList<>();
            searchPredicates.add(cb.like(cb.lower(productJoin.get("productName")), likePattern));
            searchPredicates.add(cb.like(cb.lower(brandJoin.get("brandName")), likePattern));
            searchPredicates.add(cb.like(cb.lower(sizeJoin.get("sizeName")), likePattern));
            searchPredicates.add(cb.like(cb.lower(colorJoin.get("colorName")), likePattern));

            mainPredicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
        }

        if (stockId != null) {
            Subquery<Integer> subquery = query.subquery(Integer.class);
            Root<StockVariation> subRoot = subquery.from(StockVariation.class);
            subquery.select(cb.literal(1));
            subquery.where(
                    cb.and(
                            cb.equal(subRoot.get("id").get("variationId"), root.get("id")),
                            cb.equal(subRoot.get("id").get("stockId"), stockId),
                            cb.equal(subRoot.get("stockQuantity"), -1)
                    )
            );

            mainPredicates.add(cb.not(cb.exists(subquery)));
        }

        if (query.getResultType() != Long.class && query.getResultType() != long.class) {
            query.groupBy(
                    root.get("id"),
                    root.get("product"),
                    root.get("size"),
                    root.get("color"),
                    root.get("variationImage"),
                    root.get("variationPrice"),
                    productJoin.get("productName")
            );
        }

        return cb.and(mainPredicates.toArray(new Predicate[0]));
    }
}