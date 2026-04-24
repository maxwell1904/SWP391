package com.unleashed.dto;

import com.unleashed.entity.Promotion;
import com.unleashed.entity.Variation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CartDTO {
    VariationDTO variation;
    Integer quantity;
    Integer stockQuantity;
    Promotion promotion;
}
