package com.unleashed.entity;

import com.unleashed.entity.composite.OrderVariationSingleId;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "order_variation_single", schema = "dbo")
public class OrderVariationSingle {
    @EmbeddedId
    private OrderVariationSingleId id;

    @MapsId("orderId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @MapsId("variationSingleId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variation_single_id", nullable = false)
    private VariationSingle variationSingle;

    @Column(name = "promotion_id")
    private Integer promotionId;

    @NotNull
    @Column(name = "variation_price_at_purchase", nullable = false, precision = 22, scale = 2)
    private BigDecimal variationPriceAtPurchase;

}