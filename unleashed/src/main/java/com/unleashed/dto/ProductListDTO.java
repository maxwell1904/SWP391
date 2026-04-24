package com.unleashed.dto;

import com.unleashed.entity.Category;
import com.unleashed.entity.Promotion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductListDTO {
    private String productId;
    private String productName;
    private String productDescription;
    private int brandId;
    private String brandName;
    private List<Category> categoryList;
    private String productVariationImage;
    private BigDecimal productPrice;
    private Promotion promotion;
    private BigDecimal promotionValue;
    private Double averageRating;
    private Long totalRatings;
    private int quantity;
}
