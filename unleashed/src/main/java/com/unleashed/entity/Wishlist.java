package com.unleashed.entity;

import com.unleashed.entity.composite.WishlistId;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "wishlist", schema = "dbo")
public class Wishlist {
    @EmbeddedId
    private WishlistId id;

    //TODO [Reverse Engineering] generate columns from DB
}