package com.unleashed.repo.specification;

import com.unleashed.entity.*;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class VoucherSpecification implements Specification<Voucher> {

    private final String searchTerm;
    private final Integer statusId;
    private final Integer typeId;
    private final List<Integer> voucherIds;

    public VoucherSpecification(String searchTerm, Integer statusId, Integer typeId, List<Integer> voucherIds) {
        this.searchTerm = searchTerm;
        this.statusId = statusId;
        this.typeId = typeId;
        this.voucherIds = voucherIds;
    }

    @Override
    public Predicate toPredicate(Root<Voucher> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        List<Predicate> predicates = new ArrayList<>();

        if (voucherIds != null && !voucherIds.isEmpty()) {
            predicates.add(root.get("voucherId").in(voucherIds));
        }

        if (statusId != null && statusId > 0) {
            predicates.add(cb.equal(root.get("voucherStatus").get("id"), statusId));
        }

        if (typeId != null && typeId > 0) {
            predicates.add(cb.equal(root.get("voucherType").get("id"), typeId));
        }

        if (StringUtils.hasText(searchTerm)) {
            String likePattern = "%" + searchTerm.toLowerCase() + "%";
            Predicate searchPredicate = cb.or(
                    cb.like(cb.lower(root.get("voucherCode")), likePattern),
                    cb.like(cb.lower(root.get("voucherDescription")), likePattern)
            );
            predicates.add(searchPredicate);
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    }
}