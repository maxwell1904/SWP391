package com.unleashed.dto;

import java.math.BigDecimal;

public class MonthlyRevenueDTO {
    private int day;
    private int year;
    private BigDecimal totalAmount;

    public MonthlyRevenueDTO() {
    }

    public MonthlyRevenueDTO(int day, int year, BigDecimal totalAmount) {
        this.day = day;
        this.year = year;
        this.totalAmount = totalAmount;
    }

    public int getDay() {
        return day;
    }

    public void setDay(int day) {
        this.day = day;
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