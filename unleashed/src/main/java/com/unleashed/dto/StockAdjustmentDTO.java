package com.unleashed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockAdjustmentDTO {
    private Integer stockId;
    private Integer variationId;
    private Integer quantityChange;
    private String username;
    private String reason;
}
