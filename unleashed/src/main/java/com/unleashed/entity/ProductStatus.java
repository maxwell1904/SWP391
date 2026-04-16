package com.unleashed.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "product_status", schema = "dbo")
public class ProductStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_status_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "product_status_name")
    private String productStatusName;

//    @OneToMany(mappedBy = "productStatus")
//    private Set<Product> products = new LinkedHashSet<>();

}