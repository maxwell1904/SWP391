package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "sale_type", schema = "dbo")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SaleType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_type_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "sale_type_name")
    private String saleTypeName;

//    @OneToMany(mappedBy = "saleType")
//    private Set<Sale> sales = new LinkedHashSet<>();
}