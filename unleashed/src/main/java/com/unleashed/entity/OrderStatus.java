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
@Table(name = "order_status", schema = "dbo")
public class OrderStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_status_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "order_status_name")
    private String orderStatusName;

    @JsonIgnore
    @OneToMany(mappedBy = "orderStatus")
    private Set<Order> orders = new LinkedHashSet<>();

}