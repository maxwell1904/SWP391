package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "discount", schema = "dbo")
public class Discount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_id", nullable = false)
    private Integer discountId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "discount_status_id")
    private DiscountStatus discountStatus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "discount_type_id")
    private DiscountType discountType;

    @Size(max = 20)
    @NotNull
    @Nationalized
    @Column(name = "discount_code", nullable = false, length = 20)
    private String discountCode;

    @Column(name = "discount_value", precision = 22, scale = 2)
    private BigDecimal discountValue;

    @Nationalized
    @Column(name = "discount_description")
    private String discountDescription;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "discount_rank_requirement")
    @JsonBackReference
    private Rank discountRankRequirement;

    @Column(name = "discount_minimum_order_value", precision = 22, scale = 2)
    private BigDecimal discountMinimumOrderValue;

    @Column(name = "discount_maximum_value", precision = 22, scale = 2)
    private BigDecimal discountMaximumValue;

    @Column(name = "discount_usage_limit")
    private Integer discountUsageLimit;

    @Column(name = "discount_start_date")
    private OffsetDateTime discountStartDate;

    @Column(name = "discount_end_date")
    private OffsetDateTime discountEndDate;

    @Column(name = "discount_created_at")
    private OffsetDateTime discountCreatedAt;

    @Column(name = "discount_updated_at")
    private OffsetDateTime discountUpdatedAt;

    @Column(name = "discount_usage_count")
    private Integer discountUsageCount;

//
//    @OneToMany(mappedBy = "discount")
//    private Set<Order> orders = new LinkedHashSet<>();

//    @JsonIgnore
//    @OneToMany
//    private Set<UserDiscount> userDiscounts = new LinkedHashSet<>();

    @PrePersist
    protected void onCreate() {
        setDiscountCreatedAt(OffsetDateTime.now());
        setDiscountUpdatedAt(OffsetDateTime.now());
        if (this.discountUsageCount == null) {
            this.discountUsageCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        setDiscountUpdatedAt(OffsetDateTime.now());
    }
}