package com.unleashed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Integer id;
    private String categoryName;
    private String categoryDescription;
    private String categoryImageUrl;
    private OffsetDateTime categoryCreatedAt;
    private OffsetDateTime categoryUpdatedAt;
    private Long totalQuantity;
}
