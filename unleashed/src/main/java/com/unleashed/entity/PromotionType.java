package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "promotion_type", schema = "dbo")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PromotionType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "promotion_type_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "promotion_type_name")
    private String promotionTypeName;

//    @OneToMany(mappedBy = "promotionType")
//    private Set<Promotion> promotions = new LinkedHashSet<>();
}