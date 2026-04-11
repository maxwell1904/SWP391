package com.unleashed.entity;

import com.unleashed.entity.composite.CartId;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "cart", schema = "dbo")
public class Cart {
    @EmbeddedId
    private CartId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @MapsId("variationId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variation_id", nullable = false)
    private Variation variation;

    @Column(name = "cart_quantity")
    private Integer cartQuantity;

}