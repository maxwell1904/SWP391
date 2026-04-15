package com.unleashed.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class UserReviewHistoryDTO {
    private Integer id;
    private String productId;
    private String productName;
    private String productImageUrl;
    private Integer reviewRating;
    private String commentContent;
    private OffsetDateTime commentCreatedAt;
}