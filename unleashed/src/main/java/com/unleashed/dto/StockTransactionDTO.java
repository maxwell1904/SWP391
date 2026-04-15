package com.unleashed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockTransactionDTO {
    private Integer stockId;
    private Integer variationId;
    private Integer providerId;
    private String transactionType;
    private List<ProductVariationQuantity> variations;
    private String username;


    @Data
    public static class ProductVariationQuantity {
        private Integer productVariationId;
        private Integer quantity;
    }
}
