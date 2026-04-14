package com.unleashed.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class ProductReviewDTO {
    private Integer commentId;
    private Integer reviewId;
    private String fullName;
    private Integer reviewRating;
    private String reviewComment;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String userImage;
    private List<ProductReviewDTO> childComments = new ArrayList<>();
}