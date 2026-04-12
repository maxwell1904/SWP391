package com.unleashed.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RatingSummaryDTO {
    private int totalRating;
    private double avgRating;
}
