package com.unleashed.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
public class ReviewListDTO {
    private int reviewId;
    private String username;
    private int reviewRating;
    private String reviewComment; // Thêm comment content
    private OffsetDateTime createdAt; // Thêm createdAt
}