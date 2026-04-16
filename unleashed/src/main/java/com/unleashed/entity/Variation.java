package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonView;
import com.unleashed.util.Views;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "variation", schema = "dbo")
public class Variation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variation_id", nullable = false)
    @JsonView(Views.ProductView.class)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "size_id")
    @JsonView(Views.ProductView.class)
    private Size size;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "color_id")
    @JsonView(Views.ProductView.class)
    private Color color;

    @Nationalized
    @Lob
    @Column(name = "variation_image")
    @JsonView(Views.ProductView.class)
    private String variationImage;

    @Column(name = "variation_price", precision = 22, scale = 2)
    @JsonView(Views.ProductView.class)
    private BigDecimal variationPrice;

    // @OneToMany
    // private Set<Cart> carts = new LinkedHashSet<>();

    // @OneToMany(mappedBy = "variation")
    // private Set<Transaction> transactions = new LinkedHashSet<>();
}