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
public class SaleProductId implements Serializable {
    private static final long serialVersionUID = 3200741676213093914L;
    @NotNull
    @Column(name = "sale_id", nullable = false)
    private Integer saleId;

    @NotNull
    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        SaleProductId entity = (SaleProductId) o;
        return Objects.equals(this.saleId, entity.saleId) &&
                Objects.equals(this.productId, entity.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(saleId, productId);
    }

}