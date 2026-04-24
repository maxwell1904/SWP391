package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "promotion", schema = "dbo")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "promotion_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_type_id")
    private PromotionType promotionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_status_id")
    private PromotionStatus promotionStatus;

    @Column(name = "promotion_value", precision = 22, scale = 2)
    private BigDecimal promotionValue;

    @Column(name = "promotion_start_date")
    private OffsetDateTime promotionStartDate;

    @Column(name = "promotion_end_date")
    private OffsetDateTime promotionEndDate;

    @Column(name = "promotion_created_at")
    private OffsetDateTime promotionCreatedAt;

    @Column(name = "promotion_updated_at")
    private OffsetDateTime promotionUpdatedAt;

//    @OneToMany(mappedBy = "promotion")
//    private Set<Order> orders = new LinkedHashSet<>();

//    @ManyToMany
//    @JoinTable(name = "promotion_product",
//            joinColumns = @JoinColumn(name = "promotion_id"),
//            inverseJoinColumns = @JoinColumn(name = "product_id"))
//    private Set<Product> products = new LinkedHashSet<>();

    @PrePersist
    protected void onPrePersist() {
        setPromotionCreatedAt(OffsetDateTime.now());
        setPromotionUpdatedAt(OffsetDateTime.now());
    }

    @PreUpdate
    protected void onPreUpdate() {
        setPromotionUpdatedAt(OffsetDateTime.now());
    }
}