package com.unleashed.entity.composite;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class PromotionProductId implements Serializable {
    private static final long serialVersionUID = 3200741676213093914L;
    @NotNull
    @Column(name = "promotion_id", nullable = false)
    private Integer promotionId;

    @NotNull
    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        PromotionProductId entity = (PromotionProductId) o;
        return Objects.equals(this.promotionId, entity.promotionId) &&
                Objects.equals(this.productId, entity.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(promotionId, productId);
    }

}