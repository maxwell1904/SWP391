package com.unleashed.entity.composite;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.Hibernate;
import org.hibernate.annotations.Nationalized;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class OrderVariationSingleId implements Serializable {
    private static final long serialVersionUID = -4125233335205028743L;
    @Size(max = 255)
    @NotNull
    @Nationalized
    @Column(name = "order_id", nullable = false)
    private String orderId;

    @NotNull
    @Column(name = "variation_single_id", nullable = false)
    private Integer variationSingleId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        OrderVariationSingleId entity = (OrderVariationSingleId) o;
        return Objects.equals(this.variationSingleId, entity.variationSingleId) &&
                Objects.equals(this.orderId, entity.orderId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(variationSingleId, orderId);
    }

}