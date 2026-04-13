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
public class UserDiscountId implements Serializable {
    private static final long serialVersionUID = -3576877749600329910L;
    @NotNull
    @Column(name = "discount_id", nullable = false)
    private Integer discountId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        UserDiscountId entity = (UserDiscountId) o;
        return Objects.equals(this.discountId, entity.discountId) &&
                Objects.equals(this.userId, entity.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(discountId, userId);
    }

}