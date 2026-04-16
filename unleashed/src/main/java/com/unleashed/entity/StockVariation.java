package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonView;
import com.unleashed.entity.composite.StockVariationId;
import com.unleashed.util.Views;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "stock_variation", schema = "dbo")
public class StockVariation {
    @EmbeddedId
    private StockVariationId id;

    @MapsId("stockId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @MapsId("variationId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variation_id", nullable = false)
    private Variation variation;

    @Column(name = "stock_quantity")
    @JsonView(Views.TransactionView.class)
    private Integer stockQuantity;

}