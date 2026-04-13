package com.unleashed.dto;

import com.unleashed.entity.SaleStatus;
import com.unleashed.entity.SaleType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class SaleDTO {
    private int saleId;
    private SaleType saleType;
    private BigDecimal saleValue;
    private SaleStatus saleStatus;
    private Date startDate;
    private Date endDate;
    private Integer saleStatusId;
}
