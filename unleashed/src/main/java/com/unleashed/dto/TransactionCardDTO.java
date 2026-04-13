package com.unleashed.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransactionCardDTO {
    private Integer id;
    private String variationImage;
    private String productName;
    private String stockName;
    private String transactionTypeName;
    private String categoryName;
    private String brandName;
    private String sizeName;
    private String colorName;
    private String colorHexCode;
    private BigDecimal transactionProductPrice;
    private Integer transactionQuantity;
    private OffsetDateTime transactionDate;
    private String inchargeEmployeeUsername;
    private String providerName;
}