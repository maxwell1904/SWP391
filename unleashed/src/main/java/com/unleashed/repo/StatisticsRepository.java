package com.unleashed.repo;

import com.unleashed.dto.OrderStatusDTO;
import com.unleashed.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface StatisticsRepository extends JpaRepository<Order, String> {

    @Query(value = "SELECT SUM(order_total_amount) " +
            "FROM [order] " +
            "WHERE CAST(order_date AS DATE) = CAST(GETDATE() AS DATE)", nativeQuery = true)
    BigDecimal getDailyTotalRevenue();

    @Query(value = "SELECT CAST(order_date AS DATE) as order_day, " +
            "SUM(order_total_amount) " +
            "FROM [order] " +
            "WHERE MONTH(order_date) = :month " +
            "AND YEAR(order_date) = :year " +
            "GROUP BY CAST(order_date AS DATE) " +
            "ORDER BY CAST(order_date AS DATE)", nativeQuery = true)
    List<Object[]> getMonthlyDailyRevenue(@Param("month") int month, @Param("year") int year);

    @Query(value = "SELECT SUM(order_total_amount) " +
            "FROM [order] " +
            "WHERE MONTH(order_date) = :month " +
            "AND YEAR(order_date) = :year", nativeQuery = true)
    BigDecimal getMonthlyTotalRevenue(@Param("month") int month, @Param("year") int year);

    @Query(value = "SELECT SUM(order_total_amount) " +
            "FROM [order] " +
            "WHERE YEAR(order_date) = :year", nativeQuery = true)
    BigDecimal getYearlyTotalRevenue(@Param("year") int year);

    @Query(value = "SELECT MONTH(order_date) as order_month, SUM(order_total_amount) " +
            "FROM [order] " +
            "WHERE YEAR(order_date) = :year " +
            "GROUP BY MONTH(order_date) " +
            "ORDER BY MONTH(order_date)", nativeQuery = true)
    List<Object[]> getYearlyMonthlyRevenue(@Param("year") int year);

    @Query("SELECT new com.unleashed.dto.OrderStatusDTO(o.orderId, os.orderStatusName, o.orderCreatedAt) " +
            "FROM Order o " +
            "JOIN o.orderStatus os " +
            "ORDER BY os.id ASC, o.orderCreatedAt DESC")
    Page<OrderStatusDTO> getOrderStatusList(Pageable pageable);

    @Query(value = """
            WITH ProductSales AS (
                SELECT
                    p.product_id,
                    p.product_name,
                    COUNT(ovs.variation_single_id) AS total_sold
                FROM
                    order_variation_single ovs
                JOIN
                    variation_single vs ON ovs.variation_single_id = vs.variation_single_id
                JOIN
                    variation v ON vs.variation_id = v.variation_id
                JOIN
                    product p ON v.product_id = p.product_id
                JOIN
                    [order] o ON ovs.order_id = o.order_id
                JOIN
                    order_status os ON o.order_status_id = os.order_status_id
                WHERE
                    o.order_date >= DATEADD(day, -:number_of_days, GETDATE())
                  AND os.order_status_name = 'COMPLETED'
                GROUP BY
                    p.product_id,
                    p.product_name
            )
            SELECT
                TOP (:top_n_products)
                product_name,
                total_sold
            FROM
                ProductSales
            ORDER BY
                total_sold DESC
            """, nativeQuery = true)
    List<Object[]> findBestSellingProducts(@Param("number_of_days") int numberOfDays, @Param("top_n_products") int topNProducts);

    @Query(value = """
            WITH ProductSales AS (
                SELECT
                    p.product_id,
                    p.product_name,
                    COUNT(ovs.variation_single_id) AS total_sold
                FROM
                    order_variation_single ovs
                JOIN
                    variation_single vs ON ovs.variation_single_id = vs.variation_single_id
                JOIN
                    variation v ON vs.variation_id = v.variation_id
                JOIN
                    product p ON v.product_id = p.product_id
                JOIN
                    [order] o ON ovs.order_id = o.order_id
                JOIN
                    order_status os ON o.order_status_id = os.order_status_id
                WHERE
                    os.order_status_name = 'COMPLETED'
                GROUP BY
                    p.product_id,
                    p.product_name
            )
            SELECT
                TOP (:top_n_products)
                product_name,
                total_sold
            FROM
                ProductSales
            ORDER BY
                total_sold DESC
            """, nativeQuery = true)
    List<Object[]> findAllTimeBestSellingProducts(@Param("top_n_products") int topNProducts);

}
