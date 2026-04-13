package com.unleashed.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.unleashed.entity.DiscountStatus;
import com.unleashed.entity.DiscountType;
import com.unleashed.entity.Rank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountDTO {
    private Integer discountId;
    private String discountCode;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private DiscountStatus discountStatus;
    private String discountDescription;
    private BigDecimal minimumOrderValue;
    private BigDecimal maximumDiscountValue;
    private Integer usageLimit;
    @JsonProperty("discountRank")
    private Rank rank;
    private Integer usageCount;
    private String discountTypeName;
    private String discountStatusName;
    private String rankName;
}