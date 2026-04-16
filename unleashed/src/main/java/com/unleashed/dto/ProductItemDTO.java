package com.unleashed.dto;

import com.unleashed.entity.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
public class ProductItemDTO {
    private String productId;
    private String productName;
    // Map cấu trúc: {colorName -> {sizeName -> ProductVariationDTO}}
    private Map<String, Map<String, ProductVariationDTO>> variations;
    private List<Color> colors;
    private List<Size> sizes;
    private SaleType saleType;
    private BigDecimal saleValue;
    private String description;
    private double avgRating;
    private long totalRating;
    private List<ProductReviewDTO> reviews;
    // Thông tin thương hiệu
    private Brand brand;
    // Danh sách danh mục sản phẩm
    private List<Category> categories;
    // Trạng thái sản phẩm
    private int status; // Giá trị từ 1 - 5 (OUT OF STOCK, IMPORTING, AVAILABLE, RUNNING OUT, NEW)
}
