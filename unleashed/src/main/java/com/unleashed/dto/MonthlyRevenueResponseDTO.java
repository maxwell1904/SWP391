package com.unleashed.dto;

import java.math.BigDecimal;
import java.util.List;

public class MonthlyRevenueResponseDTO {
    private List<MonthlyRevenueDTO> dailyRevenues;
    private BigDecimal totalMonthlyRevenue;

    public MonthlyRevenueResponseDTO() {
    }

    public MonthlyRevenueResponseDTO(List<MonthlyRevenueDTO> dailyRevenues, BigDecimal totalMonthlyRevenue) {
        this.dailyRevenues = dailyRevenues;
        this.totalMonthlyRevenue = totalMonthlyRevenue;
    }

    public List<MonthlyRevenueDTO> getDailyRevenues() {
        return dailyRevenues;
    }

    public void setDailyRevenues(List<MonthlyRevenueDTO> dailyRevenues) {
        this.dailyRevenues = dailyRevenues;
    }

    public BigDecimal getTotalMonthlyRevenue() {
        return totalMonthlyRevenue;
    }

    public void setTotalMonthlyRevenue(BigDecimal totalMonthlyRevenue) {
        this.totalMonthlyRevenue = totalMonthlyRevenue;
    }
}