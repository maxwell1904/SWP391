package com.unleashed.repo.specification;

import com.unleashed.entity.Promotion;
import com.unleashed.entity.PromotionStatus;
import com.unleashed.entity.PromotionType;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public class PromotionSpecification implements Specification<Promotion> {

    private final String searchTerm;
    private final String statusFilter;

    public PromotionSpecification(String searchTerm, String statusFilter) {
        this.searchTerm = searchTerm;
        this.statusFilter = statusFilter;
    }

    @Override
    public Predicate toPredicate(Root<Promotion> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        List<Predicate> allPredicates = new ArrayList<>();

        // Handle Status Filtering
        if (StringUtils.hasText(statusFilter) && !"all".equalsIgnoreCase(statusFilter)) {
            Join<Promotion, PromotionStatus> statusJoin = root.join("promotionStatus", JoinType.LEFT);
            allPredicates.add(cb.equal(cb.lower(statusJoin.get("promotionStatusName")), statusFilter.toLowerCase()));
        }

        // Handle Search Term
        if (StringUtils.hasText(searchTerm)) {
            String likePattern = "%" + searchTerm.toLowerCase() + "%";

            Join<Promotion, PromotionType> typeJoin = root.join("promotionType", JoinType.LEFT);

            // Create a list of conditions to be combined with OR
            List<Predicate> searchPredicates = new ArrayList<>();
            searchPredicates.add(cb.like(cb.lower(typeJoin.get("promotionTypeName")), likePattern));

            // Try to parse search term as a number for promotionValue search
            try {
                // Using cb.literal() is important for type safety
                searchPredicates.add(cb.equal(root.get("promotionValue"), cb.literal(Double.parseDouble(searchTerm))));
            } catch (NumberFormatException e) {
                // Ignore if not a valid number
            }

            allPredicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
        }

        return cb.and(allPredicates.toArray(new Predicate[0]));
    }
}