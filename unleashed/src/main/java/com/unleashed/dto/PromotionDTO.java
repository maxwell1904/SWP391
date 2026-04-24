package com.unleashed.dto;

import com.unleashed.entity.PromotionStatus;
import com.unleashed.entity.PromotionType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class PromotionDTO {
    private int promotionId;
    private PromotionType promotionType;
    private BigDecimal promotionValue;
    private PromotionStatus promotionStatus;
    private Date startDate;
    private Date endDate;
    private Integer promotionStatusId;
}
