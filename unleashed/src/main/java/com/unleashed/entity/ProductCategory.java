package com.unleashed.entity;

import com.unleashed.entity.composite.ProductCategoryId;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "product_category", schema = "dbo")
public class ProductCategory {
    @EmbeddedId
    private ProductCategoryId id;

    //TODO [Reverse Engineering] generate columns from DB
}