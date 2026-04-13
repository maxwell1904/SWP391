package com.unleashed.dto;

import com.unleashed.entity.Product;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PurchaseAnalysisDTO {
    String mostFrequentSize;
    String mostFrequentBrand;
    String mostFrequentCategory;
    double minPrice;
    double maxPrice;
    double averagePrice;
    double priceRangeMin;
    double priceRangeMax;
    List<Product> purchasedProducts;
}
