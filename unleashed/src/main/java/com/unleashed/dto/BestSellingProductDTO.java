package com.unleashed.dto;

public class BestSellingProductDTO {
    private String productName;
    private Long totalSold;

    public BestSellingProductDTO() {
    }

    public BestSellingProductDTO(String productName, Long totalSold) {
        this.productName = productName;
        this.totalSold = totalSold;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Long getTotalSold() {
        return totalSold;
    }

    public void setTotalSold(Long totalSold) {
        this.totalSold = totalSold;
    }
}