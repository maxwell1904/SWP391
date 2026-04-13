package com.unleashed.service;

import com.unleashed.dto.*;
import com.unleashed.repo.StatisticsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class StatisticsService {

    private static final Logger logger = LoggerFactory.getLogger(StatisticsService.class); // Khởi tạo Logger
    private final StatisticsRepository statisticsRepository;

    @Autowired
    public StatisticsService(StatisticsRepository statisticsRepository) {
        this.statisticsRepository = statisticsRepository;
    }

    public BigDecimal getDailyRevenue() {
        return statisticsRepository.getDailyTotalRevenue();
    }

//    public List<MonthlyRevenueDTO> getMonthlyRevenue() {
//        List<Object[]> monthlyDailyRevenueData = statisticsRepository.getMonthlyDailyRevenue();
//        List<MonthlyRevenueDTO> monthlyRevenueDTOs = new ArrayList<>();
//        for (Object[] data : monthlyDailyRevenueData) {
//            // Sửa đổi ở đây: Ép kiểu sang java.sql.Date trước, sau đó chuyển đổi sang LocalDate
//            Date sqlDate = (Date) data[0];
//            LocalDate day = sqlDate.toLocalDate();
//            BigDecimal totalAmount = (BigDecimal) data[1];
//            monthlyRevenueDTOs.add(new MonthlyRevenueDTO(day.getDayOfMonth(), day.getYear(), totalAmount));
//        }
//        return monthlyRevenueDTOs;
//    }

    public MonthlyRevenueResponseDTO getMonthlyRevenue(int month, int year) { // Thêm tham số tháng và năm
        List<Object[]> monthlyDailyRevenueData = statisticsRepository.getMonthlyDailyRevenue(month, year); // Truyền tháng và năm cho repository
        List<MonthlyRevenueDTO> monthlyRevenueDTOs = new ArrayList<>();
        BigDecimal monthlyTotalRevenue = statisticsRepository.getMonthlyTotalRevenue(month, year); // Lấy tổng doanh thu tháng từ repository, truyền tháng và năm

        if (monthlyTotalRevenue == null) { // Xử lý trường hợp không có doanh thu tháng
            monthlyTotalRevenue = BigDecimal.ZERO;
        }

        for (Object[] data : monthlyDailyRevenueData) {
            Date sqlDate = (Date) data[0];
            LocalDate day = sqlDate.toLocalDate();
            BigDecimal totalAmount = (BigDecimal) data[1];
            monthlyRevenueDTOs.add(new MonthlyRevenueDTO(day.getDayOfMonth(), day.getYear(), totalAmount));
        }

        return new MonthlyRevenueResponseDTO(monthlyRevenueDTOs, monthlyTotalRevenue);
    }

    public YearlyRevenueDTO getYearlyRevenue(int year) { // Thêm tham số năm
        BigDecimal yearlyTotalRevenue = statisticsRepository.getYearlyTotalRevenue(year); // Truyền năm cho repository
        if (yearlyTotalRevenue == null) { // Xử lý trường hợp không có doanh thu năm
            yearlyTotalRevenue = BigDecimal.ZERO;
        }
        return new YearlyRevenueDTO(year, yearlyTotalRevenue);
    }

    public Page<OrderStatusDTO> getOrderStatusStatistics(int page, int size) { // Thêm tham số page và size
        Pageable pageable = PageRequest.of(page, size); // Tạo Pageable object từ page và size
        return statisticsRepository.getOrderStatusList(pageable); // Gọi repository method với Pageable object
    }

    public List<BestSellingProductDTO> getBestSellingProducts(int numberOfDays, int topNProducts) {
        List<Object[]> bestSellingProductsData = statisticsRepository.findBestSellingProducts(numberOfDays, topNProducts);
        List<BestSellingProductDTO> bestSellingProductDTOs = new ArrayList<>();
        for (Object[] data : bestSellingProductsData) {
            String productName = (String) data[0];
            Long totalSold = ((Number) data[1]).longValue();

            bestSellingProductDTOs.add(new BestSellingProductDTO(productName, totalSold));
        }
        return bestSellingProductDTOs;
    }

    public List<BestSellingProductDTO> getAllTimeBestSellingProducts(int topNProducts) { // Method cho All Time Best Selling
        List<Object[]> bestSellingProductsData = statisticsRepository.findAllTimeBestSellingProducts(topNProducts); // Gọi repository method mới
        List<BestSellingProductDTO> bestSellingProductDTOs = new ArrayList<>();
        for (Object[] data : bestSellingProductsData) {
            String productName = (String) data[0];
            Long totalSold = ((Number) data[1]).longValue();

            bestSellingProductDTOs.add(new BestSellingProductDTO(productName, totalSold));
        }
        return bestSellingProductDTOs;
    }

}