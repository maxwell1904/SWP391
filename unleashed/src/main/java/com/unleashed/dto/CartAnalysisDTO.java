package com.unleashed.dto;

import com.unleashed.entity.Product;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class CartAnalysisDTO {
    Product mostFrequentProduct;
    Product highestQuantityProduct;
}
