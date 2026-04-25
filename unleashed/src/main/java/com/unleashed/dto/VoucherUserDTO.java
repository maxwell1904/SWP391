package com.unleashed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoucherUserDTO {
    private Integer userVoucherId;
    private Integer voucherId;
    private String userId;
    private Integer usageCount;
    private Date usedAt;
}
