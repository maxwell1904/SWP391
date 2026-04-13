package com.unleashed.repo.specification;

import com.unleashed.entity.*;
import com.unleashed.entity.Order;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class OrderSpecification implements Specification<Order> {

    private final String searchTerm;
    private final Integer statusId;

    public OrderSpecification(String searchTerm, Integer statusId) {
        this.searchTerm = searchTerm;
        this.statusId = statusId;
    }

    @Override
    public Predicate toPredicate(Root<Order> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        List<Predicate> andPredicates = new ArrayList<>();

        if (statusId != null) {
            andPredicates.add(cb.equal(root.get("orderStatus").get("id"), statusId));
        }

        if (StringUtils.hasText(searchTerm)) {
            String likePattern = "%" + searchTerm.toLowerCase() + "%";

            List<Predicate> orPredicates = new ArrayList<>();

            Join<Order, User> customerJoin = root.join("user", JoinType.LEFT);
            Join<Order, User> staffJoin = root.join("inchargeEmployee", JoinType.LEFT);
            Join<Order, OrderVariationSingle> ovsJoin = root.join("orderVariationSingles", JoinType.LEFT);
            Join<OrderVariationSingle, VariationSingle> vsJoin = ovsJoin.join("variationSingle", JoinType.LEFT);
            Join<VariationSingle, Variation> vJoin = vsJoin.join("variation", JoinType.LEFT);
            Join<Variation, Product> pJoin = vJoin.join("product", JoinType.LEFT);

            orPredicates.add(cb.like(cb.lower(root.get("orderId")), likePattern));
            orPredicates.add(cb.like(cb.lower(customerJoin.get("userUsername")), likePattern));
            orPredicates.add(cb.like(cb.lower(staffJoin.get("userUsername")), likePattern));
            orPredicates.add(cb.like(cb.lower(pJoin.get("productName")), likePattern));

            andPredicates.add(cb.or(orPredicates.toArray(new Predicate[0])));
        }

        query.distinct(true);

        return cb.and(andPredicates.toArray(new Predicate[0]));
    }
}