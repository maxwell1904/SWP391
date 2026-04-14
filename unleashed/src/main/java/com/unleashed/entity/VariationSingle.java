package com.unleashed.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "variation_single", schema = "dbo")
public class VariationSingle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variation_single_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variation_id", nullable = false)
    private Variation variation;

    @Column(name = "is_variation_single_bought")
    private Boolean isVariationSingleBought;

}