package com.unleashed.dto;

import com.unleashed.entity.Category;
import com.unleashed.entity.Product;
import lombok.Data;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
public class ProductSaleDTO {
    private UUID productId;
    private String productName;
    private String brandName;
    private List<String> categoryNames;
    private String firstVariationImage;

    // A static factory method to easily convert an Entity to a DTO
    public static ProductSaleDTO fromEntity(Product product) {
        ProductSaleDTO dto = new ProductSaleDTO();
        dto.setProductId(product.getProductId());
        dto.setProductName(product.getProductName());

        if (product.getBrand() != null) {
            dto.setBrandName(product.getBrand().getBrandName());
        }

        if (product.getCategories() != null) {
            dto.setCategoryNames(product.getCategories().stream()
                    .map(Category::getCategoryName)
                    .collect(Collectors.toList()));
        }

        if (product.getProductVariations() != null && !product.getProductVariations().isEmpty()) {
            dto.setFirstVariationImage(product.getProductVariations().get(0).getVariationImage());
        }

        return dto;
    }
}