package com.unleashed.repo.specification;

import com.unleashed.entity.*;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class DiscountSpecification implements Specification<Discount> {

    private final String searchTerm;
    private final Integer statusId;
    private final Integer typeId;
    private final List<Integer> discountIds;

    public DiscountSpecification(String searchTerm, Integer statusId, Integer typeId, List<Integer> discountIds) {
        this.searchTerm = searchTerm;
        this.statusId = statusId;
        this.typeId = typeId;
        this.discountIds = discountIds;
    }

    @Override
    public Predicate toPredicate(Root<Discount> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        List<Predicate> predicates = new ArrayList<>();

        if (discountIds != null && !discountIds.isEmpty()) {
            predicates.add(root.get("discountId").in(discountIds));
        }

        if (statusId != null && statusId > 0) {
            predicates.add(cb.equal(root.get("discountStatus").get("id"), statusId));
        }

        if (typeId != null && typeId > 0) {
            predicates.add(cb.equal(root.get("discountType").get("id"), typeId));
        }

        if (StringUtils.hasText(searchTerm)) {
            String likePattern = "%" + searchTerm.toLowerCase() + "%";
            Predicate searchPredicate = cb.or(
                    cb.like(cb.lower(root.get("discountCode")), likePattern),
                    cb.like(cb.lower(root.get("discountDescription")), likePattern)
            );
            predicates.add(searchPredicate);
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    }
}