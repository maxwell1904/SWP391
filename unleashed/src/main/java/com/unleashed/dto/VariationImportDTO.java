package com.unleashed.dto;

import com.unleashed.entity.Variation;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class VariationImportDTO {
    private Integer id;
    private String productName;
    private String brandName;
    private String sizeName;
    private String colorName;
    private String variationImage;
    private BigDecimal variationPrice;

    @Setter
    private Integer currentStock;

    public static VariationImportDTO fromEntity(Variation v) {
        VariationImportDTO dto = new VariationImportDTO();
        dto.setId(v.getId());
        dto.setVariationImage(v.getVariationImage());
        dto.setVariationPrice(v.getVariationPrice());

        if (v.getProduct() != null) {
            dto.setProductName(v.getProduct().getProductName());
            if (v.getProduct().getBrand() != null) {
                dto.setBrandName(v.getProduct().getBrand().getBrandName());
            }
        }
        if (v.getSize() != null) {
            dto.setSizeName(v.getSize().getSizeName());
        }
        if (v.getColor() != null) {
            dto.setColorName(v.getColor().getColorName());
        }
        return dto;
    }
}