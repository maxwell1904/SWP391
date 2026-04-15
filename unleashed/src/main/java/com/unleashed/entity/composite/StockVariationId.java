package com.unleashed.entity.composite;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class StockVariationId implements Serializable {
    private static final long serialVersionUID = 5366573655920177816L;
    @NotNull
    @Column(name = "stock_id", nullable = false)
    private Integer stockId;

    @NotNull
    @Column(name = "variation_id", nullable = false)
    private Integer variationId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        StockVariationId entity = (StockVariationId) o;
        return Objects.equals(this.variationId, entity.variationId) &&
                Objects.equals(this.stockId, entity.stockId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(variationId, stockId);
    }

}