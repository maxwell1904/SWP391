package com.unleashed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandDTO {
    private Integer brandId;
    private String brandName;
    private String brandDescription;
    private String brandImageUrl;
    private String brandWebsiteUrl;
    private OffsetDateTime brandCreatedAt;
    private OffsetDateTime brandUpdatedAt;
    private Long totalQuantity;
}
