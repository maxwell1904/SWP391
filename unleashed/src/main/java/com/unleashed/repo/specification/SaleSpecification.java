package com.unleashed.repo.specification;

import com.unleashed.entity.Sale;
import com.unleashed.entity.SaleStatus;
import com.unleashed.entity.SaleType;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public class SaleSpecification implements Specification<Sale> {

    private final String searchTerm;
    private final String statusFilter;

    public SaleSpecification(String searchTerm, String statusFilter) {
        this.searchTerm = searchTerm;
        this.statusFilter = statusFilter;
    }

    @Override
    public Predicate toPredicate(Root<Sale> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        List<Predicate> allPredicates = new ArrayList<>();

        // Handle Status Filtering
        if (StringUtils.hasText(statusFilter) && !"all".equalsIgnoreCase(statusFilter)) {
            Join<Sale, SaleStatus> statusJoin = root.join("saleStatus", JoinType.LEFT);
            allPredicates.add(cb.equal(cb.lower(statusJoin.get("saleStatusName")), statusFilter.toLowerCase()));
        }

        // Handle Search Term
        if (StringUtils.hasText(searchTerm)) {
            String likePattern = "%" + searchTerm.toLowerCase() + "%";

            Join<Sale, SaleType> typeJoin = root.join("saleType", JoinType.LEFT);

            // Create a list of conditions to be combined with OR
            List<Predicate> searchPredicates = new ArrayList<>();
            searchPredicates.add(cb.like(cb.lower(typeJoin.get("saleTypeName")), likePattern));

            // Try to parse search term as a number for saleValue search
            try {
                // Using cb.literal() is important for type safety
                searchPredicates.add(cb.equal(root.get("saleValue"), cb.literal(Double.parseDouble(searchTerm))));
            } catch (NumberFormatException e) {
                // Ignore if not a valid number
            }

            allPredicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
        }

        return cb.and(allPredicates.toArray(new Predicate[0]));
    }
}