package com.unleashed.dto;

import com.unleashed.entity.Sale;
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
    Sale sale;
}
