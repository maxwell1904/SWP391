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
@Table(name = "voucher", schema = "dbo")
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "voucher_id", nullable = false)
    private Integer voucherId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "voucher_status_id")
    private VoucherStatus voucherStatus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "voucher_type_id")
    private VoucherType voucherType;

    @Size(max = 20)
    @NotNull
    @Nationalized
    @Column(name = "voucher_code", nullable = false, length = 20)
    private String voucherCode;

    @Column(name = "voucher_value", precision = 22, scale = 2)
    private BigDecimal voucherValue;

    @Nationalized
    @Column(name = "voucher_description")
    private String voucherDescription;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "voucher_rank_requirement")
    @JsonBackReference
    private Rank voucherRankRequirement;

    @Column(name = "voucher_minimum_order_value", precision = 22, scale = 2)
    private BigDecimal voucherMinimumOrderValue;

    @Column(name = "voucher_maximum_value", precision = 22, scale = 2)
    private BigDecimal voucherMaximumValue;

    @Column(name = "voucher_usage_limit")
    private Integer voucherUsageLimit;

    @Column(name = "voucher_start_date")
    private OffsetDateTime voucherStartDate;

    @Column(name = "voucher_end_date")
    private OffsetDateTime voucherEndDate;

    @Column(name = "voucher_created_at")
    private OffsetDateTime voucherCreatedAt;

    @Column(name = "voucher_updated_at")
    private OffsetDateTime voucherUpdatedAt;

    @Column(name = "voucher_usage_count")
    private Integer voucherUsageCount;

//
//    @OneToMany(mappedBy = "voucher")
//    private Set<Order> orders = new LinkedHashSet<>();

//    @JsonIgnore
//    @OneToMany
//    private Set<UserVoucher> userVouchers = new LinkedHashSet<>();

    @PrePersist
    protected void onCreate() {
        setVoucherCreatedAt(OffsetDateTime.now());
        setVoucherUpdatedAt(OffsetDateTime.now());
        if (this.voucherUsageCount == null) {
            this.voucherUsageCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        setVoucherUpdatedAt(OffsetDateTime.now());
    }
}