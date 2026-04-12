package com.unleashed.dto;

import java.math.BigDecimal;

public class YearlyRevenueDTO {
    private int year;
    private BigDecimal totalAmount;

    public YearlyRevenueDTO() {
    }

    public YearlyRevenueDTO(int year, BigDecimal totalAmount) {
        this.year = year;
        this.totalAmount = totalAmount;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}