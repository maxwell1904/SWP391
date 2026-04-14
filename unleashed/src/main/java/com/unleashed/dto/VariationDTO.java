package com.unleashed.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class VariationDTO {
    private Integer id;
    private BigDecimal variationPrice;
    private String variationImage;
    private String colorName;
    private String sizeName;
}