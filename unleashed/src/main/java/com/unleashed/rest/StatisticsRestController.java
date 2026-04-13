package com.unleashed.rest;

import com.unleashed.dto.BestSellingProductDTO;
import com.unleashed.dto.MonthlyRevenueResponseDTO;
import com.unleashed.dto.OrderStatusDTO;
import com.unleashed.dto.YearlyRevenueDTO;
import com.unleashed.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsRestController {
    private final StatisticsService statisticsService;

    @Autowired
    public StatisticsRestController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

//    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
//    @GetMapping("/revenue/total")
//    public BigDecimal totalRevenue() {
//        return statisticsService.getDailyRevenue(); // Đổi tên method service nếu cần thiết để rõ ràng hơn
//    }
//
//    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
//    @GetMapping("/revenue/daily")
//    public ResponseEntity<BigDecimal> dailyRevenue() {
//        BigDecimal dailyRevenue = statisticsService.getDailyRevenue();
//        return ResponseEntity.ok(dailyRevenue);
//    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping("/revenue/monthly")
    public ResponseEntity<MonthlyRevenueResponseDTO> monthlyRevenue(
            @RequestParam(value = "month", required = false) Integer month, // Thêm RequestParam cho tháng, required=false để tháng hiện tại là mặc định
            @RequestParam(value = "year", required = false) Integer year // Thêm RequestParam cho năm, required=false để năm hiện tại là mặc định
    ) {
        int currentMonth = (month != null) ? month : LocalDate.now().getMonthValue(); // Sử dụng tháng hiện tại nếu không có tham số
        int currentYear = (year != null) ? year : LocalDate.now().getYear(); // Sử dụng năm hiện tại nếu không có tham số
        MonthlyRevenueResponseDTO monthlyRevenueResponseDTO = statisticsService.getMonthlyRevenue(currentMonth, currentYear);
        return ResponseEntity.ok(monthlyRevenueResponseDTO);
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping("/revenue/yearly")
    public ResponseEntity<YearlyRevenueDTO> yearlyRevenue(
            @RequestParam(value = "year", required = false) Integer year // Thêm RequestParam cho năm, required=false để năm hiện tại là mặc định
    ) {
        int currentYear = (year != null) ? year : LocalDate.now().getYear(); // Sử dụng năm hiện tại nếu không có tham số
        YearlyRevenueDTO yearlyRevenueDTO = statisticsService.getYearlyRevenue(currentYear);
        return ResponseEntity.ok(yearlyRevenueDTO);
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping("/order-status-list")
    public ResponseEntity<Page<OrderStatusDTO>> getOrderStatusList(
            @RequestParam(value = "page", defaultValue = "0") int page, // RequestParam cho số trang, mặc định là 0
            @RequestParam(value = "size", defaultValue = "20") int size // RequestParam cho kích thước trang, mặc định là 20
    ) {
        Page<OrderStatusDTO> orderStatusDTOPage = statisticsService.getOrderStatusStatistics(page, size); // Gọi service method với page và size
        return ResponseEntity.ok(orderStatusDTOPage); // Trả về Page object
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping("/best-selling-products") // Endpoint mới cho best selling products
    public ResponseEntity<List<BestSellingProductDTO>> getBestSellingProducts(
            @RequestParam(value = "numberOfDays", defaultValue = "30") int numberOfDays, // RequestParam cho số ngày thống kê, mặc định là 30
            @RequestParam(value = "topNProducts", defaultValue = "10") int topNProducts // RequestParam cho số lượng top sản phẩm, mặc định là 10
    ) {
        List<BestSellingProductDTO> bestSellingProductDTOs = statisticsService.getBestSellingProducts(numberOfDays, topNProducts); // Gọi service method
        return ResponseEntity.ok(bestSellingProductDTOs); // Trả về danh sách BestSellingProductDTO
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping("/best-selling-products/all-time") // Endpoint mới cho All Time Best Selling Products
    public ResponseEntity<List<BestSellingProductDTO>> getAllTimeBestSellingProducts(
            @RequestParam(value = "topNProducts", defaultValue = "10") int topNProducts // RequestParam cho số lượng top sản phẩm, mặc định là 10
    ) {
        List<BestSellingProductDTO> bestSellingProductDTOs = statisticsService.getAllTimeBestSellingProducts(topNProducts); // Gọi service method mới
        return ResponseEntity.ok(bestSellingProductDTOs);
    }

}