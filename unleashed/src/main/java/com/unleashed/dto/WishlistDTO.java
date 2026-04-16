package com.unleashed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WishlistDTO {
    private UUID userId;
    private UUID productId;
    private String productName;
    private String productImage;
    private Integer productStatus;
}
