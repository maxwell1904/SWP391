package com.unleashed.entity;

import com.unleashed.entity.composite.UserDiscountId;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_discount", schema = "dbo")
public class UserDiscount {
    @EmbeddedId
    private UserDiscountId id;

    @MapsId("discountId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "discount_id", nullable = false)
    private Discount discount;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "is_discount_used", nullable = false)
    private Boolean isDiscountUsed = false;

    @Column(name = "discount_used_at")
    private OffsetDateTime discountUsedAt;

}