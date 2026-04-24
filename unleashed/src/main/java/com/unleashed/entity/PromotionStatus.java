package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "promotion_status", schema = "dbo")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PromotionStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "promotion_status_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "promotion_status_name")
    private String promotionStatusName;

//    @OneToMany(mappedBy = "promotionStatus")
//    private Set<Promotion> promotions = new LinkedHashSet<>();
}