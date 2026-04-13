package com.unleashed.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SimplifiedTransactionCardDTO {
    private Integer transactionId;
    private UUID productId;
    private String variationImage;
    private String productName;
    private String stockName;
    private String transactionTypeName;
    private String brandName;
    private String sizeName;
    private String colorName;
    private String colorHexCode;
    private BigDecimal transactionProductPrice;
    private Integer transactionQuantity;
    private LocalDate transactionDate;
    private String inchargeEmployeeUsername;
    private String providerName;
}