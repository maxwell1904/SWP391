package com.unleashed.dto;

import com.unleashed.entity.ProductStatus;
import com.unleashed.entity.SaleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    private String productId;
    private String productName;
    private String productCode;
    private String productDescription;
    private String productImageUrl;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Integer brandId;
    private ProductStatus productStatusId;
    private List<Integer> categoryIdList;
    private BigDecimal productPrice;
    private List<ProductVariationDTO> variations;
    private SaleType saleType;
    private BigDecimal saleValue;
    private Double averageRating;
    private Long totalRatings;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductVariationDTO {
        private Integer sizeId;
        private Integer colorId;
        private BigDecimal productPrice;
        private String productVariationImage;
    }
}
