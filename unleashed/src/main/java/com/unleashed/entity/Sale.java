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
@Table(name = "sale", schema = "dbo")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_type_id")
    private SaleType saleType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_status_id")
    private SaleStatus saleStatus;

    @Column(name = "sale_value", precision = 22, scale = 2)
    private BigDecimal saleValue;

    @Column(name = "sale_start_date")
    private OffsetDateTime saleStartDate;

    @Column(name = "sale_end_date")
    private OffsetDateTime saleEndDate;

    @Column(name = "sale_created_at")
    private OffsetDateTime saleCreatedAt;

    @Column(name = "sale_updated_at")
    private OffsetDateTime saleUpdatedAt;

//    @OneToMany(mappedBy = "sale")
//    private Set<Order> orders = new LinkedHashSet<>();

//    @ManyToMany
//    @JoinTable(name = "sale_product",
//            joinColumns = @JoinColumn(name = "sale_id"),
//            inverseJoinColumns = @JoinColumn(name = "product_id"))
//    private Set<Product> products = new LinkedHashSet<>();

    @PrePersist
    protected void onPrePersist() {
        setSaleCreatedAt(OffsetDateTime.now());
        setSaleUpdatedAt(OffsetDateTime.now());
    }

    @PreUpdate
    protected void onPreUpdate() {
        setSaleUpdatedAt(OffsetDateTime.now());
    }
}