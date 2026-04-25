package com.unleashed.dto;

import com.unleashed.entity.VoucherStatus;
import com.unleashed.entity.VoucherType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoucherDTO {
    private Integer voucherId;
    private String voucherCode;
    private VoucherType voucherType;
    private BigDecimal voucherValue;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private VoucherStatus voucherStatus;
    private String voucherDescription;
    private BigDecimal minimumOrderValue;
    private BigDecimal maximumVoucherValue;
    private Integer usageLimit;
    private Integer usageCount;
    private String voucherTypeName;
    private String voucherStatusName;
}
