package com.unleashed.dto;

import com.unleashed.entity.Product;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScoredProductDTO {
    Product product;
    double score;
    double priceDifference;

    public ScoredProductDTO(Product product, double score, double priceDifference) {
        this.product = product;
        this.score = score;
        this.priceDifference = priceDifference;
    }
}
