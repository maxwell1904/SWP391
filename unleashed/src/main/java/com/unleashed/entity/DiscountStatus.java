package com.unleashed.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "discount_status", schema = "dbo")
public class DiscountStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_status_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "discount_status_name")
    private String discountStatusName;

}