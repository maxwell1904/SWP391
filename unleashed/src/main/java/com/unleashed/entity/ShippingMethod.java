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
@Table(name = "shipping_method", schema = "dbo")
public class ShippingMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shipping_method_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "shipping_method_name")
    private String shippingMethodName;

//    @OneToMany(mappedBy = "shippingMethod")
//    private Set<Order> orders = new LinkedHashSet<>();

}