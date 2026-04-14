package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "rank", schema = "dbo")
public class Rank {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rank_id", nullable = false)
    private Integer id;

    @Nationalized
    @Lob
    @Column(name = "rank_name")
    private String rankName;

    @Column(name = "rank_num")
    private Integer rankNum;

    @Column(name = "rank_payment_requirement", precision = 22, scale = 2)
    private BigDecimal rankPaymentRequirement;

    @Column(name = "rank_base_discount", precision = 3, scale = 2)
    private BigDecimal rankBaseDiscount;

    @JsonIgnore
    @OneToMany(mappedBy = "discountRankRequirement")
    private Set<Discount> discounts = new LinkedHashSet<>();

}