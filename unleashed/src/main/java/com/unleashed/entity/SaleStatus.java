package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "sale_status", schema = "dbo")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SaleStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_status_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "sale_status_name")
    private String saleStatusName;

//    @OneToMany(mappedBy = "saleStatus")
//    private Set<Sale> sales = new LinkedHashSet<>();
}