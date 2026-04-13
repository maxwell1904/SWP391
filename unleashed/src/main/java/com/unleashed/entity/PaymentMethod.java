package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "payment_method", schema = "dbo")
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_method_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "payment_method_name")
    private String paymentMethodName;

    @JsonIgnore
    @OneToMany(mappedBy = "paymentMethod")
    private Set<Order> orders = new LinkedHashSet<>();

}