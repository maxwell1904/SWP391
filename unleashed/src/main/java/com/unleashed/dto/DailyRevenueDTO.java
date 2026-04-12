package com.unleashed.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DailyRevenueDTO {
    private LocalDate day;
    private BigDecimal totalAmount;

    public DailyRevenueDTO() {
    }

    public DailyRevenueDTO(LocalDate day, BigDecimal totalAmount) {
        this.day = day;
        this.totalAmount = totalAmount;
    }

    public LocalDate getDay() {
        return day;
    }

    public void setDay(LocalDate day) {
        this.day = day;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}