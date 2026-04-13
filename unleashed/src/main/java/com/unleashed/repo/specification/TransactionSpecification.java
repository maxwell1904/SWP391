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

public class TransactionSpecification implements Specification<Transaction> {

    private final String searchTerm;
    private final String dateFilter;

    public TransactionSpecification(String searchTerm, String dateFilter) {
        this.searchTerm = searchTerm;
        this.dateFilter = dateFilter;
    }

    @Override
    public Predicate toPredicate(Root<Transaction> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        List<Predicate> allPredicates = new ArrayList<>();

        // 1. Apply the date filter first
        addDatePredicate(allPredicates, root, cb);

        // 2. Apply the search term filter if it exists
        if (StringUtils.hasText(searchTerm)) {
            addSearchPredicate(allPredicates, root, cb);
        }

        query.distinct(true); // Prevent duplicates from joins

        // Combine all conditions with AND
        return cb.and(allPredicates.toArray(new Predicate[0]));
    }

    private void addDatePredicate(List<Predicate> predicates, Root<Transaction> root, CriteriaBuilder cb) {
        LocalDate now = LocalDate.now();
        Path<OffsetDateTime> transactionDate = root.get("transactionDate");
        OffsetDateTime startDateTime;

        switch (dateFilter) {
            case "today":
                startDateTime = now.atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
                predicates.add(cb.greaterThanOrEqualTo(transactionDate, startDateTime));
                break;
            case "week":
                startDateTime = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
                predicates.add(cb.greaterThanOrEqualTo(transactionDate, startDateTime));
                break;
            case "month":
                startDateTime = now.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
                predicates.add(cb.greaterThanOrEqualTo(transactionDate, startDateTime));
                break;
            case "6months":
                startDateTime = now.minusMonths(6).atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
                predicates.add(cb.greaterThanOrEqualTo(transactionDate, startDateTime));
                break;
            case "all":
            default:
                // No date predicate needed for "all"
                break;
        }
    }

    private void addSearchPredicate(List<Predicate> predicates, Root<Transaction> root, CriteriaBuilder cb) {
        String likePattern = "%" + searchTerm.toLowerCase() + "%";

        // --- Joins to related entities needed for searching ---
        Join<Transaction, Variation> variationJoin = root.join("variation", JoinType.LEFT);
        Join<Variation, Product> productJoin = variationJoin.join("product", JoinType.LEFT);
        Join<Transaction, User> staffJoin = root.join("inchargeEmployee", JoinType.LEFT);
        Join<Transaction, Provider> providerJoin = root.join("provider", JoinType.LEFT);
        Join<Transaction, TransactionType> typeJoin = root.join("transactionType", JoinType.LEFT);

        // --- List of conditions to be combined with OR ---
        List<Predicate> searchPredicates = new ArrayList<>();
        searchPredicates.add(cb.like(cb.lower(productJoin.get("productName")), likePattern));
        searchPredicates.add(cb.like(cb.lower(staffJoin.get("userUsername")), likePattern));
        searchPredicates.add(cb.like(cb.lower(providerJoin.get("providerName")), likePattern));
        searchPredicates.add(cb.like(cb.lower(typeJoin.get("transactionTypeName")), likePattern));

        // Add the combined OR conditions to the main list of predicates
        predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
    }
}