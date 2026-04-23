package com.unleashed.repo;

import com.unleashed.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Collection;


@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {

    @Query("SELECT o FROM Order o " +
            "LEFT JOIN FETCH o.user u " +
            "WHERE (:status IS NULL OR o.orderStatus = :status) " +
            "AND (:userId IS NULL OR o.user.userId = :userId) " +
            "ORDER BY o.orderDate DESC")
    Page<Order> findAllByStatusAndUserId(String status, UUID userId, Pageable pageable);


    @Query("SELECT o FROM Order o WHERE o.user.userId = :userId ORDER BY o.orderDate DESC")
    Page<Order> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Modifying
    @Query("UPDATE Order o SET o.orderStatus.orderStatusName = 'CANCELLED' WHERE o.orderId = :orderId")
    void updateOrderStatusToCancelled(@Param("orderId") String orderId);

    @Query("SELECT o FROM Order o left join User u on u.userUsername = o.user.userUsername WHERE u.userUsername = :username AND o.orderId = :orderId ")
    Optional<Order> findOrderByUserIdAndOrderId(String username, String orderId);

    @Query("SELECT SUM(o.orderTotalAmount) FROM Order o WHERE o.orderStatus.orderStatusName = 'COMPLETED'")
    Double findTotalRevenue();

    @Query("SELECT o.orderDate, SUM(o.orderTotalAmount) FROM Order o WHERE o.orderStatus.orderStatusName = 'COMPLETED' GROUP BY o.orderDate ORDER BY o.orderDate ASC")
    List<Object[]> findDailyRevenue();

    @Query(value = """
            SELECT
                YEAR(o.order_date) AS year,
                MONTH(o.order_date) AS month,
                SUM(o.order_total_amount) AS totalAmount
            FROM "order" o
            WHERE o.order_status_id = 4
            GROUP BY YEAR(o.order_date), MONTH(o.order_date)
            ORDER BY year, month
            """, nativeQuery = true)
    List<Object[]> findMonthlyRevenue();


    @Query("SELECT o.orderStatus, COUNT(o) FROM Order o GROUP BY o.orderStatus")
    List<Object[]> findOrderStatusStatistics();

    @Query(value = """
            SELECT
                v.product_id AS productId,
                p.product_name AS productName,
                COUNT(ovs.variation_single_id) AS totalSold
            FROM order_variation_single ovs
            JOIN variation_single vs ON ovs.variation_single_id = vs.variation_single_id
            JOIN variation v ON vs.variation_id = v.variation_id
            JOIN product p ON v.product_id = p.product_id
            GROUP BY v.product_id, p.product_name
            ORDER BY totalSold DESC
            """, nativeQuery = true)
    List<Object[]> findBestSellingProducts();

    @Query(value = """
            SELECT
                p.product_id AS productId,
                p.product_name AS productName,
                COUNT(ovs.variation_single_id) AS totalQuantitySold
            FROM
                "order" o
            JOIN
                order_variation_single ovs ON o.order_id = ovs.order_id
            JOIN
                variation_single vs ON ovs.variation_single_id = vs.variation_single_id
            JOIN
                variation v ON vs.variation_id = v.variation_id
            JOIN
                product p ON v.product_id = p.product_id
            WHERE
                o.order_status_id = 4 AND FORMAT(o.order_date, 'yyyy-MM') = :month
            GROUP BY
                p.product_id, p.product_name
            ORDER BY
                totalQuantitySold DESC
            """, nativeQuery = true)
    List<Object[]> findBestSellingByMonth(@Param("month") String month);

    @Query(value = """
            SELECT
                os.order_status_name AS orderStatus,
                COUNT(o.order_id) AS totalOrders
            FROM
                "order" o
            JOIN
                order_status os ON o.order_status_id = os.order_status_id
            WHERE
                FORMAT(o.order_date, 'yyyy-MM') = :month
            GROUP BY
                os.order_status_name
            ORDER BY
                totalOrders DESC
            """, nativeQuery = true)
    List<Object[]> findOrderStatusByMonth(@Param("month") String month);

    @Query("SELECT o FROM Order o WHERE o.user.userId = :userId ORDER BY o.orderCreatedAt DESC")
    List<Order> findRecentOrdersByUserId(@Param("userId") UUID userId, Pageable pageable);

    boolean existsByUser_UserIdAndDiscount_DiscountId(UUID userId, Integer discountId);

    @Query(value = """
            WITH ProductSales AS (
                SELECT
                    v.product_id,
                    COUNT(ovs.variation_single_id) AS total_sold
                FROM
                    product p
                JOIN
                    variation v ON p.product_id = v.product_id
                JOIN
                    variation_single vs ON v.variation_id = vs.variation_id
                JOIN
                    order_variation_single ovs ON vs.variation_single_id = ovs.variation_single_id
                JOIN
                    "order" o ON ovs.order_id = o.order_id
                WHERE
                    o.order_date >= DATEADD(day, -:number_of_days, GETDATE())
                GROUP BY
                    v.product_id
            )
            SELECT
                TOP (:top_n_products) product_id
            FROM
                ProductSales
            ORDER BY
                total_sold DESC
            """, nativeQuery = true)
    List<UUID> findTopSoldProductIds(@Param("number_of_days") int numberOfDays, @Param("top_n_products") int topNProducts);

    @Query(value = "SELECT o FROM Order o " +
            "ORDER BY CASE WHEN o.orderStatus.orderStatusName = 'PENDING' THEN 1 ELSE 2 END ASC, " +
            "o.orderCreatedAt DESC",
            countQuery = "SELECT count(o) FROM Order o")
    Page<Order> findAllWithPriority(Pageable pageable);

    @Query("""
        SELECT DISTINCT o FROM Order o
        JOIN o.orderVariationSingles ovs
        JOIN ovs.variationSingle vs
        JOIN vs.variation v
        WHERE o.user.userId = :userId
        AND v.product.productId = :productId
        AND o.orderStatus.orderStatusName = 'COMPLETED'
        """)
    List<Order> findCompletedOrdersByUserAndProduct(@Param("userId") UUID userId, @Param("productId") UUID productId);

    boolean existsByUser_UserIdAndOrderStatus_OrderStatusNameIn(UUID userId, Collection<String> statusNames);
}
