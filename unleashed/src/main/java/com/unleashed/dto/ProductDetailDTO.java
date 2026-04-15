package com.unleashed.dto;


import com.unleashed.entity.Brand;
import com.unleashed.entity.Category;
import com.unleashed.entity.ProductStatus;
import com.unleashed.entity.Variation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductDetailDTO {
    private String productId;
    private String productName;
    private String productCode;
    private String productDescription;
    private OffsetDateTime productCreatedAt;
    private OffsetDateTime productUpdatedAt;
    private Brand brand;
    private ProductStatus productStatusId;
    private List<Category> categories;
    private List<Variation> productVariations;


}
