package com.unleashed.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Integer variationSingleId;
    private Integer reviewId;
    private String productId;

    @Min(value = 1, message = "Rating must be at least 1 star") // **Rating tối thiểu 1**
    @Max(value = 5, message = "Rating cannot be more than 5 stars") // **Rating tối đa 5**
    private Integer reviewRating;

    @Size(max = 500, message = "Comment must be 500 characters or less") // **Comment tối đa 500 ký tự**
    private String reviewComment;

    private Date createdAt;
    private String username;
    private String orderId;
    private String userId;
}
