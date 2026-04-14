package com.unleashed.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "discount_type", schema = "dbo")
public class DiscountType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_type_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "discount_type_name")
    private String discountTypeName;

}