package com.unleashed.service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.unleashed.dto.ItemDataDTO;
import com.unleashed.dto.OrderDTO;
import com.unleashed.dto.PayOsLinkRequestBodyDTO;
import com.unleashed.dto.mapper.OrderDetailMapper;
import com.unleashed.dto.mapper.OrderMapper;
import com.unleashed.dto.mapper.ProductVariationMapper;
import com.unleashed.entity.*;
import com.unleashed.entity.composite.OrderVariationSingleId;
import com.unleashed.repo.*;
import com.unleashed.repo.specification.OrderSpecification;
import com.unleashed.util.AppTaskScheduler;
import jakarta.persistence.Tuple;
import jakarta.servlet.http.HttpServletRequest;
import org.json.JSONObject;
import org.slf4j.ILoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;


@Service
public class OrderService {

    private static final SimpleDateFormat DATE_FORMATTER = new SimpleDateFormat("dd/MM/yyyy");
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final VariationSingleRepository variationSingleRepository;
    private final OrderVariationSingleRepository orderVariationSingleRepository;
    private final CartService cartService;
    private final OrderMapper orderMapper;
    private final OrderDetailMapper orderDetailMapper;
    private final VNPayService vnPayService;
    //    private final PayOsRestController payOsRestController;
    private final EmailService emailService;
    private final OrderDetailService orderDetailService;
    private final ProductVariationService productVariationService;
    private final VariationRepository variationRepository;
    private final ProductVariationMapper productVariationMapper;
    private final UserRepository userRepository;
    private final VoucherService voucherService;
    private final OrderStatusRepository orderStatusRepository;
    private final StockVariationRepository stockVariationRepository;
    private final UserService userService;
    private final ReviewRepository reviewRepository;
    private final StockTransactionService stockTransactionService;
    private boolean isCancellingOrder = false;
    private static final Logger logger = LoggerFactory.getLogger(AppTaskScheduler.class);

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        OrderMapper orderMapper,
                        OrderDetailMapper orderDetailMapper,
                        VNPayService vnPayService,
//                        PayOsRestController payOsRestController,
                        EmailService emailService,
                        ProductVariationService productVariationService,
                        VariationRepository variationRepository,
                        ProductVariationMapper productVariationMapper,
                        OrderDetailService orderDetailService,
                        UserRepository userRepository,
                        ProductRepository productRepository,
                        ReviewRepository reviewRepository,
                        VoucherService voucherService,
                        OrderStatusRepository orderStatusRepository,
                        VariationSingleRepository variationSingleRepository,
                        OrderVariationSingleRepository orderVariationSingleRepository,
                        CartService cartService,
                        StockVariationRepository stockVariationRepository,
                        UserService userService,
                        StockTransactionService stockTransactionService) {
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
        this.orderDetailMapper = orderDetailMapper;
        this.vnPayService = vnPayService;
//        this.payOsRestController = payOsRestController;
        this.emailService = emailService;
        this.orderDetailService = orderDetailService;
        this.productVariationService = productVariationService;
        this.variationRepository = variationRepository;
        this.productVariationMapper = productVariationMapper;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
        this.voucherService = voucherService;
        this.orderStatusRepository = orderStatusRepository;
        this.variationSingleRepository = variationSingleRepository;
        this.orderVariationSingleRepository = orderVariationSingleRepository;
        this.cartService = cartService;
        this.stockVariationRepository = stockVariationRepository;
        this.userService = userService;
        this.stockTransactionService = stockTransactionService;
    }


//    @Transactional
//    public Page<OrderDTO> getOrders(String status, String userId, Pageable pageable) {
//        Page<Order> orders = orderRepository.findAllByStatusAndUserId(status, userId, pageable);
//        return orders.map(orderMapper::toDTO);
//    }

    @Transactional
    public Optional<Map<String, Object>> getOrderById(String orderId) {
        return orderRepository.findById(orderId).map(order -> {
            Map<String, Object> orderJson = new HashMap<>();
            orderJson.put("orderId", order.getOrderId());
            orderJson.put("totalAmount", order.getOrderTotalAmount());
            orderJson.put("orderStatus", order.getOrderStatus().getOrderStatusName());
            orderJson.put("orderDate", order.getOrderDate());
            orderJson.put("billingAddress", order.getOrderBillingAddress());
            orderJson.put("shippingMethod", order.getShippingMethod().getShippingMethodName());
            orderJson.put("expectedDeliveryDate", order.getOrderExpectedDeliveryDate());
            orderJson.put("transactionReference", order.getOrderTransactionReference());
            orderJson.put("paymentMethod", order.getPaymentMethod().getPaymentMethodName());
            orderJson.put("trackingNumber", order.getOrderTrackingNumber());
            orderJson.put("orderTrackingNumber", order.getOrderTrackingNumber());
            orderJson.put("customerUsername", order.getUser().getUsername());
            orderJson.put("customerUserId", order.getUser().getUserId());
            orderJson.put("notes", order.getOrderNote());
            orderJson.put("staffUsername",
                    order.getInchargeEmployee() != null ? order.getInchargeEmployee().getUsername() : "N/A");
                orderJson.put("reviewedByUsername",
                    order.getInchargeEmployee() != null ? order.getInchargeEmployee().getUsername() : null);
                orderJson.put("reviewedByRole",
                    order.getInchargeEmployee() != null && order.getInchargeEmployee().getRole() != null
                        ? order.getInchargeEmployee().getRole().getRoleName()
                        : null);

            Map<Variation, Long> variationCounts = order.getOrderVariationSingles().stream()
                    .collect(Collectors.groupingBy(
                            ovs -> ovs.getVariationSingle().getVariation(),
                            Collectors.counting()
                    ));

            List<Map<String, Object>> orderDetailsList = new ArrayList<>();
            for (Map.Entry<Variation, Long> entry : variationCounts.entrySet()) {
                Variation variation = entry.getKey();
                Long quantity = entry.getValue();

                Map<String, Object> detailJson = new HashMap<>();
                detailJson.put("productId", variation.getProduct().getProductId());
                detailJson.put("productName", variation.getProduct().getProductName());
                detailJson.put("color", variation.getColor().getColorName());
                detailJson.put("size", variation.getSize().getSizeName());
                detailJson.put("productImage", variation.getVariationImage());
                detailJson.put("orderQuantity", quantity);

                BigDecimal unitPrice = order.getOrderVariationSingles().stream()
                        .filter(od -> od.getVariationSingle().getVariation().equals(variation))
                        .findFirst()
                        .map(OrderVariationSingle::getVariationPriceAtPurchase)
                        .orElse(BigDecimal.ZERO);

                detailJson.put("unitPrice", unitPrice);

                // This part for checking reviews can be optimized if needed, but is functionally correct
                boolean hasReviewed = reviewRepository.existsByProductAndUser(variation.getProduct(), order.getUser());
                detailJson.put("hasReviewed", hasReviewed);

                detailJson.put("orderTrackingNumber", order.getOrderTrackingNumber());
                orderDetailsList.add(detailJson);
            }

            long totalOrderQuantity = orderDetailsList.stream()
                    .mapToLong(d -> (Long) d.get("orderQuantity"))
                    .sum();

            orderJson.put("totalOrderQuantity", (int) totalOrderQuantity);
            orderJson.put("orderDetails", orderDetailsList);

            return orderJson;
        });
    }


    @Transactional
    public Map<String, Object> getOrdersByUserIdWithValidation(String userId, Pageable pageable) {
        Sort sort = Sort.by("orderUpdatedAt").descending();
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        Page<Order> ordersPage = orderRepository.findByUserId(UUID.fromString(userId), sortedPageable);

        List<Map<String, Object>> ordersList = ordersPage.getContent().stream().map(order -> {
            Map<String, Object> orderJson = new HashMap<>();
            orderJson.put("orderId", order.getOrderId());
            orderJson.put("orderStatus", order.getOrderStatus().getOrderStatusName());
            orderJson.put("totalAmount", order.getOrderTotalAmount());
            orderJson.put("orderTrackingNumber", order.getOrderTrackingNumber());

            // Aggregate details directly from the order's entities
            Map<Variation, Long> variationCounts = order.getOrderVariationSingles().stream()
                    .collect(Collectors.groupingBy(
                            ovs -> ovs.getVariationSingle().getVariation(),
                            Collectors.counting()
                    ));

            List<Map<String, Object>> orderDetailsList = new ArrayList<>();
            for (Map.Entry<Variation, Long> entry : variationCounts.entrySet()) {
                Variation variation = entry.getKey();
                Long quantity = entry.getValue();

                Map<String, Object> detailJson = new HashMap<>();
                detailJson.put("productName", variation.getProduct().getProductName());
                detailJson.put("productCode", variation.getProduct().getProductCode());
                detailJson.put("color", variation.getColor().getColorName());
                detailJson.put("size", variation.getSize().getSizeName());
                detailJson.put("quantity", quantity); // Add quantity for the frontend
                orderDetailsList.add(detailJson);
            }

            orderJson.put("orderDetails", orderDetailsList);
            return orderJson;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("orders", ordersList);
        response.put("currentPage", ordersPage.getNumber());
        response.put("totalItems", ordersPage.getTotalElements());
        response.put("totalPages", ordersPage.getTotalPages());

        return response;
    }


    @Transactional
    public Optional<Map<String, Object>> getMyOrderById(String orderId, String username) {
        return orderRepository.findOrderByUserIdAndOrderId(username, orderId).map(order -> {
            Map<String, Object> orderJson = new HashMap<>();
            orderJson.put("orderId", order.getOrderId());
            orderJson.put("totalAmount", order.getOrderTotalAmount());
            orderJson.put("orderStatus", order.getOrderStatus().getOrderStatusName());
            orderJson.put("orderDate", order.getOrderDate());
            orderJson.put("billingAddress", order.getOrderBillingAddress());
            orderJson.put("shippingMethod", order.getShippingMethod().getShippingMethodName());
            orderJson.put("expectedDeliveryDate", order.getOrderExpectedDeliveryDate());
            orderJson.put("transactionReference", order.getOrderTransactionReference());
            orderJson.put("paymentMethod", order.getPaymentMethod().getPaymentMethodName());
            orderJson.put("trackingNumber", order.getOrderTrackingNumber());
            orderJson.put("orderTrackingNumber", order.getOrderTrackingNumber());
            orderJson.put("customerUsername", order.getUser().getUsername());
            orderJson.put("customerUserId", order.getUser().getUserId());
            orderJson.put("notes", order.getOrderNote());

            // Aggregate details directly from the order's entities, just like in getOrderById
            Map<Variation, Long> variationCounts = order.getOrderVariationSingles().stream()
                    .collect(Collectors.groupingBy(
                            ovs -> ovs.getVariationSingle().getVariation(),
                            Collectors.counting()
                    ));

            List<Map<String, Object>> orderDetailsList = new ArrayList<>();
            for (Map.Entry<Variation, Long> entry : variationCounts.entrySet()) {
                Variation variation = entry.getKey();
                Long quantity = entry.getValue();

                Map<String, Object> detailJson = new HashMap<>();
                detailJson.put("productId", variation.getProduct().getProductId());
                detailJson.put("productName", variation.getProduct().getProductName());
                detailJson.put("color", variation.getColor().getColorName());
                detailJson.put("size", variation.getSize().getSizeName());
                detailJson.put("productImage", variation.getVariationImage());
                detailJson.put("orderQuantity", quantity);

                BigDecimal unitPrice = order.getOrderVariationSingles().stream()
                        .filter(od -> od.getVariationSingle().getVariation().equals(variation))
                        .findFirst()
                        .map(OrderVariationSingle::getVariationPriceAtPurchase)
                        .orElse(BigDecimal.ZERO);
                detailJson.put("unitPrice", unitPrice);

                boolean hasReviewed = reviewRepository.existsByProductAndUser(variation.getProduct(), order.getUser());
                detailJson.put("hasReviewed", hasReviewed);

                detailJson.put("orderTrackingNumber", order.getOrderTrackingNumber());
                orderDetailsList.add(detailJson);
            }

            long totalOrderQuantity = orderDetailsList.stream()
                    .mapToLong(d -> (Long) d.get("orderQuantity"))
                    .sum();

            orderJson.put("totalOrderQuantity", (int) totalOrderQuantity);
            orderJson.put("orderDetails", orderDetailsList);
            return orderJson;
        });
    }


    @Transactional
    public Map<String, Object> getOrders(String search, String sort, Integer statusId, int page, int size) {
        Specification<Order> spec = new OrderSpecification(search, statusId);

        Pageable pageable;
        if ("totalPrice_asc".equals(sort)) {
            pageable = PageRequest.of(page, size, Sort.by("orderTotalAmount").ascending());
        } else if ("totalPrice_desc".equals(sort)) {
            pageable = PageRequest.of(page, size, Sort.by("orderTotalAmount").descending());
        } else {
            if (StringUtils.hasText(search) || statusId != null) {
                pageable = PageRequest.of(page, size, Sort.by("orderUpdatedAt").descending());
            } else {
                Page<Order> ordersPage = orderRepository.findAllWithPriority(PageRequest.of(page, size));
                return mapOrderPageToResponse(ordersPage);
            }
        }

        Page<Order> ordersPage = orderRepository.findAll(spec, pageable);
        return mapOrderPageToResponse(ordersPage);
    }

    public List<OrderStatus> getAllOrderStatuses() {
        return orderStatusRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    // Helper method to map the Page<Order> to the response structure.
    private Map<String, Object> mapOrderPageToResponse(Page<Order> ordersPage) {
        List<Map<String, Object>> ordersList = ordersPage.getContent().stream()
                .map(order -> {
                    // This is your existing detailed mapping logic.
                    Map<String, Object> orderJson = new HashMap<>();
                    orderJson.put("orderId", order.getOrderId());
                    orderJson.put("totalAmount", order.getOrderTotalAmount());
                    orderJson.put("orderStatus", order.getOrderStatus().getOrderStatusName());
                    orderJson.put("orderDate", order.getOrderDate());
                    orderJson.put("billingAddress", order.getOrderBillingAddress());
                    orderJson.put("shippingMethod", order.getShippingMethod().getShippingMethodName());
                    orderJson.put("expectedDeliveryDate", order.getOrderExpectedDeliveryDate());
                    orderJson.put("transactionReference", order.getOrderTransactionReference());
                    orderJson.put("paymentMethod", order.getPaymentMethod().getPaymentMethodName());
                    orderJson.put("trackingNumber", order.getOrderTrackingNumber());
                    orderJson.put("customerUsername", order.getUser().getUsername());
                    orderJson.put("notes", order.getOrderNote());
                    orderJson.put("staffUsername",
                            order.getInchargeEmployee() != null ? order.getInchargeEmployee().getUsername() : "N/A");
                        orderJson.put("reviewedByUsername",
                            order.getInchargeEmployee() != null ? order.getInchargeEmployee().getUsername() : null);
                        orderJson.put("reviewedByRole",
                            order.getInchargeEmployee() != null && order.getInchargeEmployee().getRole() != null
                                ? order.getInchargeEmployee().getRole().getRoleName()
                                : null);
                    return orderJson;
                }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("orders", ordersList);
        response.put("currentPage", ordersPage.getNumber());
        response.put("totalItems", ordersPage.getTotalElements());
        response.put("totalPages", ordersPage.getTotalPages());

        return response;
    }


    @Transactional
    public Map<String, Object> getOrdersByUserId(String userId, Pageable pageable) {
        Page<Order> ordersPage;
        if (userId == null || userId.trim().isEmpty()) {
            ordersPage = orderRepository.findAllWithPriority(pageable);
        } else {
            Sort sort = Sort.by("orderUpdatedAt").descending();
            Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
            ordersPage = orderRepository.findByUserId(UUID.fromString(userId), sortedPageable);
        }

        List<Map<String, Object>> ordersList = ordersPage.getContent().stream()
                .map(order -> {
                    Map<String, Object> orderJson = new HashMap<>();
                    orderJson.put("orderId", order.getOrderId());
                    orderJson.put("totalAmount", order.getOrderTotalAmount());
                    orderJson.put("orderStatus", order.getOrderStatus().getOrderStatusName());
                    orderJson.put("orderDate", order.getOrderDate());
                    orderJson.put("billingAddress", order.getOrderBillingAddress());
                    orderJson.put("shippingMethod", order.getShippingMethod().getShippingMethodName());
                    orderJson.put("expectedDeliveryDate", order.getOrderExpectedDeliveryDate());
                    orderJson.put("transactionReference", order.getOrderTransactionReference());
                    orderJson.put("paymentMethod", order.getPaymentMethod().getPaymentMethodName());
                    orderJson.put("orderTrackingNumber", order.getOrderTrackingNumber());
                    orderJson.put("customerUsername", order.getUser().getUsername());
                    orderJson.put("notes", order.getOrderNote());
                    orderJson.put("staffUsername",
                            order.getInchargeEmployee() != null ? order.getInchargeEmployee().getUsername() : "N/A");
                        orderJson.put("reviewedByUsername",
                            order.getInchargeEmployee() != null ? order.getInchargeEmployee().getUsername() : null);
                        orderJson.put("reviewedByRole",
                            order.getInchargeEmployee() != null && order.getInchargeEmployee().getRole() != null
                                ? order.getInchargeEmployee().getRole().getRoleName()
                                : null);

                    Map<Variation, Long> variationCounts = order.getOrderVariationSingles().stream()
                            .collect(Collectors.groupingBy(
                                    ovs -> ovs.getVariationSingle().getVariation(),
                                    Collectors.counting()
                            ));

                    List<Map<String, Object>> detailsList = new ArrayList<>();
                    for (Map.Entry<Variation, Long> entry : variationCounts.entrySet()) {
                        Variation variation = entry.getKey();
                        Long quantity = entry.getValue();

                        Map<String, Object> detail = new HashMap<>();
                        detail.put("productName", variation.getProduct().getProductName());
                        detail.put("color", variation.getColor().getColorName());
                        detail.put("size", variation.getSize().getSizeName());
                        detail.put("orderQuantity", quantity);

                        BigDecimal unitPrice = order.getOrderVariationSingles().stream()
                                .filter(od -> od.getVariationSingle().getVariation().equals(variation))
                                .findFirst()
                                .map(OrderVariationSingle::getVariationPriceAtPurchase)
                                .orElse(BigDecimal.ZERO);
                        detail.put("unitPrice", unitPrice);

                        detail.put("orderTrackingNumber", order.getOrderTrackingNumber());
                        detailsList.add(detail);
                    }

                    long totalOrderQuantity = detailsList.stream()
                            .mapToLong(d -> (Long) d.get("orderQuantity"))
                            .sum();

                    orderJson.put("totalOrderQuantity", (int) totalOrderQuantity);
                    orderJson.put("orderDetails", detailsList);
                    return orderJson;
                }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("orders", ordersList);
        response.put("currentPage", ordersPage.getNumber());
        response.put("totalItems", ordersPage.getTotalElements());
        response.put("totalPages", ordersPage.getTotalPages());

        return response;
    }

    private Variation getVariationFromVariationCodeWithoutRandom(String variationCode) {
        if (variationCode == null) {
            return null;
        }
        try {
            String[] parts = variationCode.split("-");
            if (parts.length >= 3) {
                String productCode = parts[0];
                String colorName = parts[1];
                colorName = colorName.substring(0, 1).toUpperCase() + colorName.substring(1).toLowerCase();
                String sizeName = parts[2];
                return variationRepository.findByProduct_ProductCodeAndColor_ColorNameAndSize_SizeName(
                        productCode, colorName, sizeName
                ).orElse(null);
            } else {
                System.err.println("Invalid variationCode format (wrong number of parts): " + variationCode);
                return null;
            }
        } catch (Exception e) {
            System.err.println("Error parsing variationCode: " + variationCode + " - " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }


//    @Transactional
//    public List<OrderDetailDTO> getOrderDetails(String orderId) {
//        return orderDetailService.getOrderDetailsByOrderId(orderId);
//    }

    @Transactional
    public Map<String, Object> createOrder(OrderDTO orderDTO, HttpServletRequest request) {

        Order order = Order.builder()
                .user(userRepository.findById(UUID.fromString(orderDTO.getUserId())).orElse(null))
                .orderDate(OffsetDateTime.now())
                .orderNote(orderDTO.getNotes())
                .orderBillingAddress(orderDTO.getUserAddress())
                .orderExpectedDeliveryDate(orderDTO.getShippingMethod().getShippingMethodName()
                        .equalsIgnoreCase("EXPRESS")
                        ?
                        Date.from(OffsetDateTime.now().plusDays(7).toInstant())
                        :
                        Date.from(OffsetDateTime.now().plusDays(25).toInstant()))
                .orderTax(BigDecimal.valueOf(0.05)) // Still dunno
                .orderTrackingNumber(generateTrackingNumber())
                .paymentMethod(orderDTO.getPaymentMethod())
                .shippingMethod(orderDTO.getShippingMethod())
                .orderTotalAmount(BigDecimal.valueOf(orderDTO.getTotalAmount()))
                .orderTransactionReference(generateDefaultTransactionReference())
                .orderStatus(orderStatusRepository.findById(1).orElse(null))
                .build();
        order = orderRepository.saveAndFlush(order);

        if (orderDTO.getUserId() != null && orderDTO.getUserAddress() != null) {
            userService.updateUserAddress(orderDTO.getUserId(), orderDTO.getUserAddress());
        }

        if (orderDTO.getUserId() != null && orderDTO.getPaymentMethod() != null) {
            userService.updateUserPaymentMethod(orderDTO.getUserId(), orderDTO.getPaymentMethod().getPaymentMethodName());
        }

        // 2. Check Voucher
        if (StringUtils.hasText(orderDTO.getVoucherCode())) {
            try {
                Voucher appliedVoucher = voucherService.findVoucherEntityByCode(orderDTO.getVoucherCode())
                        .orElseThrow(() -> new IllegalStateException("Voucher code not found."));
                voucherService.updateUsageLimit(orderDTO.getVoucherCode(), orderDTO.getUserId());
                order.setVoucher(appliedVoucher);
            } catch (Exception e) {
                throw new IllegalStateException("Failed to apply voucher: " + e.getMessage());
            }
        }

        // Always re-check stock on the backend to prevent stale client-side stock checks.
        checkStockAvailability(orderDTO);

        List<OrderVariationSingle> orderVariationSingles = saveOrderDetails(order, orderDTO);

        JSONObject paymentResponse = handlePayment(order, orderDTO, orderVariationSingles, request);

        Map<String, Object> jsonResponse = buildOrderResponseJson(order, orderVariationSingles);

        if (paymentResponse != null && paymentResponse.has("redirectUrl")) {
            jsonResponse.put("redirectUrl", paymentResponse.get("redirectUrl"));
        }

        return jsonResponse;
    }


    private Map<String, Object> buildOrderResponseJson(Order order, List<OrderVariationSingle> orderDetails) {
        Map<String, Object> jsonResponse = new HashMap<>();
        jsonResponse.put("orderId", order.getOrderId());
        jsonResponse.put("orderDate", order.getOrderDate());
        jsonResponse.put("totalAmount", order.getOrderTotalAmount());
        jsonResponse.put("paymentMethod", order.getPaymentMethod());
        jsonResponse.put("shippingMethod", order.getShippingMethod());
        jsonResponse.put("orderStatus", order.getOrderStatus().getOrderStatusName());
        jsonResponse.put("transactionReference", order.getOrderTransactionReference());

        List<Map<String, Object>> productDetails = new ArrayList<>();
        if (orderDetails != null && !orderDetails.isEmpty()) {
            Map<Variation, Long> variationCounts = orderDetails.stream()
                    .collect(Collectors.groupingBy(
                            detail -> detail.getVariationSingle().getVariation(),
                            Collectors.counting()
                    ));

            for (Map.Entry<Variation, Long> entry : variationCounts.entrySet()) {
                Variation variation = entry.getKey();
                Long quantity = entry.getValue();

                Map<String, Object> productJson = new HashMap<>();
                productJson.put("productName", variation.getProduct().getProductName());
                productJson.put("size", variation.getSize().getSizeName());
                productJson.put("color", variation.getColor().getColorName());
                productJson.put("quantity", quantity);

                // Find the price from one of the corresponding order details
                BigDecimal unitPrice = orderDetails.stream()
                        .filter(od -> od.getVariationSingle().getVariation().equals(variation))
                        .findFirst()
                        .map(OrderVariationSingle::getVariationPriceAtPurchase)
                        .orElse(BigDecimal.ZERO);

                productJson.put("unitPrice", unitPrice);
                productDetails.add(productJson);
            }
        }

        jsonResponse.put("productDetails", productDetails);
        return jsonResponse;
    }


    private Order initializeOrder(OrderDTO orderDTO) {
        Order order = new Order();

        if (orderDTO.getOrderId() == null || orderDTO.getOrderId().isEmpty()) {
            orderDTO.setOrderId(generateOrderId());
        }
        order.setOrderId(orderDTO.getOrderId());

        setUser(order, orderDTO.getUserId());
        order.setOrderDate(OffsetDateTime.now());
//        order.setOrderStatus(Order.OrderStatus.PENDING);
        order.setOrderTotalAmount(BigDecimal.valueOf(orderDTO.getTotalAmount()));

        order.setOrderBillingAddress(orderDTO.getUserAddress());
        order.setPaymentMethod(orderDTO.getPaymentMethod());
        order.setShippingMethod(orderDTO.getShippingMethod());

        // Tạo tracking_number ngẫu nhiên
        order.setOrderTrackingNumber(generateTrackingNumber());

        order.setOrderNote(orderDTO.getNotes());
        order.setVoucher(orderDTO.getVoucher());
        order.setOrderBillingAddress(orderDTO.getBillingAddress());

        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, 10);
        order.setOrderExpectedDeliveryDate(calendar.getTime());

        order.setOrderTransactionReference(orderDTO.getTransactionReference() != null ? orderDTO.getTransactionReference() : generateDefaultTransactionReference());

        return order;
    }

    // Thay vì setUserId, ta sẽ tạo User và gán vào order
    private void setUser(Order order, String userId) {
        if (userId != null) {
            User user = new User();
            user.setUserId(UUID.fromString(userId));
            order.setUser(user);
        }
    }

    // Tạo phương thức generateDefaultTransactionReference()
    private String generateDefaultTransactionReference() {
        // Giới hạn độ dài để phù hợp với độ dài tối đa của cột `transaction_reference`
        return String.valueOf(System.currentTimeMillis()).substring(6); // Lấy 6 ký tự cuối cùng
    }


    private List<OrderVariationSingle> saveOrderDetails(Order order, OrderDTO orderDTO) {
        if (orderDTO.getOrderDetails() == null || orderDTO.getOrderDetails().isEmpty()) {
            throw new IllegalArgumentException("Order details cannot be null");
        }

        List<OrderVariationSingle> savedOrderVariationSingles = new ArrayList<>();
        try {
            orderDTO.getOrderDetails().forEach(detail -> {
                Variation variation = variationRepository.findById(detail.getVariationId()).orElse(null);
                if (variation != null) {
                    for (int i = 0; i < detail.getOrderQuantity(); i++) {
                        VariationSingle variationSingle = VariationSingle.builder()
                                .variation(variation)
                                .isVariationSingleBought(true)
                                .build();
                        variationSingle = variationSingleRepository.save(variationSingle);

                        OrderVariationSingle orderVariationSingle = OrderVariationSingle.builder()
                                .id(OrderVariationSingleId.builder()
                                        .variationSingleId(variationSingle.getId())
                                        .orderId(order.getOrderId())
                                        .build())
                                .order(order)
                                .variationSingle(variationSingle)
                                .variationPriceAtPurchase(detail.getUnitPrice())
                                .build();

                        OrderVariationSingle savedOvs = orderVariationSingleRepository.save(orderVariationSingle);

                        order.getOrderVariationSingles().add(savedOvs);

                        savedOrderVariationSingles.add(savedOvs);
                    }
                } else {
                    System.err.println("Variation not found");
                }
            });

            stockTransactionService.createReservationTransactionsForOrder(order);

            cartService.removeAllFromCart(order.getUser().getUserId().toString());
        } catch (Exception e) {
            System.err.println("Failed to save order details: " + e.getMessage());
            throw new RuntimeException("Failed to save order details", e);
        }

        return savedOrderVariationSingles;
    }

    private JSONObject handlePayment(Order order, OrderDTO orderDTO, List<OrderVariationSingle> orderDetails, HttpServletRequest request) {
        if (orderDetails == null || orderDetails.isEmpty()) {
            throw new IllegalArgumentException("Order details cannot be null or empty for payment processing");
        }
//        System.out.println(order.getPaymentMethod().getPaymentMethodName().toUpperCase(Locale.ROOT));
        switch (order.getPaymentMethod().getPaymentMethodName().toUpperCase(Locale.ROOT)) {
            case "PAYOS":
                return handlePayOsPayment(order, orderDTO, orderDetails, request);
            case "VNPAY":
                return handleVNPayPayment(order, orderDTO, orderDetails, request);
            case "COD":
                return handleCODPayment(order);
            case "TRANSFER":
                return handleTransferPayment(order);
            default:
                throw new IllegalArgumentException("Invalid payment method: " + orderDTO.getPaymentMethod());
        }
    }


//    private List<ItemDataDTO> createItemDataList(OrderDTO orderDTO) {
//        return orderDTO.getOrderDetails().stream()
//                .map(orderDetail -> new ItemDataDTO(
//                        null, // Hoặc lấy tên từ một nguồn khác nếu có
//                        orderDetail.getVariationId(),
//                        orderDetail.getUnitPrice().intValue(),
//                        orderDetail.getOrderQuantity()
//                ))
//                .collect(Collectors.toList());
//    }

    private JSONObject handlePayOsPayment(Order order, OrderDTO orderDTO, List<OrderVariationSingle> orderDetails, HttpServletRequest request) {
        List<ItemDataDTO> itemDataList = orderDTO.getOrderDetails().stream()
                .map(detail -> {
                    ItemDataDTO item = new ItemDataDTO();
                    String productName = productRepository.getProductNameById(detail.getVariationId());
                    item.setName(productName);
                    item.setPrice(detail.getUnitPrice().intValue());
                    item.setQuantity(detail.getOrderQuantity());
                    return item;
                })
                .collect(Collectors.toList());

        PayOsLinkRequestBodyDTO payOsRequest = new PayOsLinkRequestBodyDTO(
                "Thanh Toán Đơn Hàng",
                null,
                (int) (orderDTO.getTotalAmount() * 1),
                null,
                itemDataList
        );

//        ObjectNode paymentLinkResponse = payOsRestController.createPaymentLink(payOsRequest, request);

        return handlePaymentResponse(order, null, orderDetails);
    }


    private JSONObject handleCODPayment(Order order) {
//        order.setOrderStatus(Order.OrderStatus.PENDING);

        orderRepository.save(order);
//        System.out.println("Get here");
        sendOrderConfirmationEmail(order);

        JSONObject response = new JSONObject();
        response.put("error", 0);
        response.put("message", "Order created with COD payment");

        return response;
    }

    private JSONObject handleTransferPayment(Order order) {
//        order.setOrderStatus(Order.OrderStatus.PENDING);
        orderRepository.save(order);
        sendOrderConfirmationEmail(order);

        JSONObject response = new JSONObject();
        response.put("error", 0);
        response.put("message", "Order created with bank transfer payment");
        return response;
    }


    private JSONObject handleVNPayPayment(Order order, OrderDTO orderDTO, List<OrderVariationSingle> orderDetails, HttpServletRequest request) {
        int totalAmountInCents = (int) (orderDTO.getTotalAmount() * 1);
        String returnUrl = resolveVnPayReturnUrl();
        String paymentLink = vnPayService.createOrder(
                totalAmountInCents,
                "Order " + order.getOrderId(),
            returnUrl,
                request
        );

        String transactionReference = extractTransactionCode(paymentLink);
        order.setOrderTransactionReference(transactionReference);
        orderRepository.save(order);
        sendOrderConfirmationEmail(order);
        return redirectPayment(paymentLink);
    }

    private String resolveVnPayReturnUrl() {
        String configuredUrl = System.getProperty("VNPAY_RETURN_URL");
        if (!StringUtils.hasText(configuredUrl)) {
            configuredUrl = System.getenv("VNPAY_RETURN_URL");
        }
        if (StringUtils.hasText(configuredUrl)) {
            return configuredUrl.trim();
        }
        return "http://localhost:3000/orders/success";
    }


    private String extractTransactionCode(String paymentLink) {
        if (paymentLink == null || paymentLink.isEmpty()) {
            return "000000"; // Mã mặc định nếu không có paymentLink
        }

        if (paymentLink.contains("vnp_TxnRef")) {
            // URL của VNPAY, lấy giá trị của tham số `vnp_TxnRef`
            String[] params = paymentLink.split("&");
            for (String param : params) {
                if (param.startsWith("vnp_TxnRef=")) {
                    return param.substring("vnp_TxnRef=".length());
                }
            }
        } else if (paymentLink.contains("pay.payos.vn")) {
            // URL của PAYOS, lấy 32 ký tự cuối (mã giao dịch)
            return paymentLink.substring(paymentLink.lastIndexOf('/') + 1);
        }

        return "000000"; // Trả về mã mặc định nếu không khớp định dạng
    }


    private JSONObject handlePaymentResponse(Order order, ObjectNode paymentLinkResponse, List<OrderVariationSingle> orderVariationSingles) {
        if (paymentLinkResponse.get("error").asInt() == 0) {
            String paymentLink = paymentLinkResponse.get("data").get("checkoutUrl").asText(); // Sử dụng checkoutUrl
            String transactionReference = extractTransactionCode(paymentLink);
            order.setOrderTransactionReference(transactionReference);
            orderRepository.save(order);
            sendOrderConfirmationEmail(order);
            return redirectPayment(paymentLink);
        }
        return null;
    }


    private JSONObject redirectPayment(String paymentLink) {
        JSONObject response = new JSONObject();
        response.put("error", 0);
        response.put("message", "success");
        response.put("redirectUrl", paymentLink);
        return response;
    }

    public void handlePaymentCallback(String orderId, boolean isSuccess) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null) {
            // Only proceed if the order is in the PENDING status
            if (order.getOrderStatus().getOrderStatusName().equalsIgnoreCase("PENDING")) {
                // System.out.println("Order is not in PENDING status. Payment callback will not be processed.");
                return;
            }

            // Update the order status based on the payment success
            order.setOrderStatus(isSuccess ? orderStatusRepository.findAll().get(2)
                    : orderStatusRepository.findAll().get(5));
            orderRepository.save(order);

            // Send payment callback email
            sendPaymentCallbackEmail(order, isSuccess);
        }
    }


    private String generateOrderId() {
        long orderCount = orderRepository.count();
        return String.format("ORD%03d", orderCount + 1);
    }


    @Transactional
    public void cancelOrder(String orderId) {
        isCancellingOrder = true;

        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid order ID: " + orderId));

            if ((order.getOrderStatus().getOrderStatusName().equalsIgnoreCase("PENDING")
                    || order.getOrderStatus().getOrderStatusName().equalsIgnoreCase("PROCESSING"))) {
                order.setOrderStatus(orderStatusRepository.findById(5)
                        .orElseThrow(() -> new IllegalStateException("OrderStatus with ID 5 (CANCELLED) not found.")));

                orderRepository.save(order);

                if (!order.getOrderStatus().getOrderStatusName().equalsIgnoreCase("CANCELLED")) {
                    throw new IllegalStateException("Order status was not updated to CANCELLED");
                }

            } else if (order.getOrderStatus().getOrderStatusName().equalsIgnoreCase("SHIPPING")) {
                order.setOrderStatus(orderStatusRepository.findById(6)
                        .orElseThrow(() -> new IllegalStateException("OrderStatus with ID 6 (RETURNED) not found.")));

                orderRepository.save(order);

                if (!(order.getOrderStatus().getOrderStatusName().equalsIgnoreCase("RETURNED"))) {
                    throw new IllegalStateException("Order status was not updated to RETURNED");
                }

            } else {
                throw new IllegalStateException("Cannot cancel an order that is not pending or processing.");
            }
            returnStock(order);

        } finally {
            isCancellingOrder = false;
        }
    }


    private void sendOrderConfirmationEmail(Order order) {
        String subject = "Order Confirmation #" + order.getOrderId();
//        String body = buildOrderEmailBody(order, order.getOrderVariationSingles(), "Your order has been successfully created! Thank you for shopping at Unleashed!");

//        emailService.sendHtmlMessage(order.getUser().getUserEmail(), subject, body);
    }

    private void sendPaymentCallbackEmail(Order order, boolean isSuccess) {
        String subject = isSuccess ? "Payment Successful - Order #" + order.getOrderId() : "Payment Failed - Order #" + order.getOrderId();
        String message = isSuccess ? "Your order has been successfully paid and is being processed." : "Unfortunately, the payment for your order has failed.";
        String body = buildPaymentCallbackEmailBody(order, message);
        emailService.sendHtmlMessage(order.getUser().getUserEmail(), subject, body);
    }

    private void sendOrderCancellationEmail(Order order) {
        String subject = "Order Cancellation Notification - Order #" + order.getOrderId();
        String body = buildOrderCancellationEmailBody(order); // Call the cancellation-specific email body
        emailService.sendHtmlMessage(order.getUser().getUserEmail(), subject, body);
    }


    private void sendOrderCreatedEmail(Order order) {
        String subject = "Order Created #" + order.getOrderId();
        String body = buildOrderEmailBody(order, order.getOrderVariationSingles(), "Your order has been created! Please complete the payment so we can process your order.");
        emailService.sendHtmlMessage(order.getUser().getUserEmail(), subject, body);
    }

    private void sendPaymentSuccessEmail(Order order) {
        String subject = "Payment Successful for Order #" + order.getOrderId();
        String body = buildOrderEmailBody(order, order.getOrderVariationSingles(), "Your order has been successfully paid! Your order is being processed.");
        emailService.sendHtmlMessage(order.getUser().getUserEmail(), subject, body);
    }


    // Phương thức chuyển đổi OrderDetails thành danh sách ProductVariations
    private Set<Variation> convertOrderDetailsToProductVariations(Set<OrderVariationSingle> orderVariationSingles) {
//        if (orderVariationSingles == null) {
//            System.out.println("orderDetails is null in convertOrderDetailsToProductVariations");
//        } else {
//            System.out.println("orderDetails in convertOrderDetailsToProductVariations: " + orderVariationSingles);
//        }

        Set<Variation> productVariations = new HashSet<>();
        for (OrderVariationSingle orderVariationSingle : orderVariationSingles) {
            variationRepository.findById(orderVariationSingle.getId().getVariationSingleId())
                    .ifPresent(productVariations::add);
        }
        return productVariations;
    }

    // Phương thức lấy số lượng đơn hàng tương ứng cho một variation
    private int getOrderQuantityForVariation(Set<OrderVariationSingle> orderVariationSingles, String variationId) {
//        if (orderVariationSingles == null) {
//            System.out.println("orderDetails is null in getOrderQuantityForVariation");
//        } else {
//            System.out.println("orderDetails in getOrderQuantityForVariation: " + orderVariationSingles);
//        }
        for (OrderVariationSingle orderVariationSingle : orderVariationSingles) {
//            if (detail.getVariationId().equals(variationId)) {
            return orderVariationSingle.getId().getVariationSingleId();
//        }
        }
        return 0; // Trả về 0 nếu không tìm thấy
    }

    @Transactional
    public void reviewOrderByStaff(String orderId, String staffName, boolean isApproved) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid order ID"));

        User staff = userRepository.findByUserUsername(staffName)
                .orElseThrow(() -> new IllegalArgumentException("Invalid staff name"));

        String currentStatus = order.getOrderStatus().getOrderStatusName();

        if (currentStatus.equalsIgnoreCase("PENDING")) {
            order.setInchargeEmployee(staff);
            if (isApproved) {
                OrderStatus processingStatus = orderStatusRepository.findById(2)
                        .orElseThrow(() -> new IllegalStateException("OrderStatus with ID 2 (PROCESSING) not found."));
                order.setOrderStatus(processingStatus);
            } else {
                OrderStatus cancelledStatus = orderStatusRepository.findById(7)
                        .orElseThrow(() -> new IllegalStateException("OrderStatus with ID 7 (CANCELLED) not found."));
                order.setOrderStatus(cancelledStatus);
                returnStock(order);
            }
            orderRepository.save(order);

        } else if (currentStatus.equalsIgnoreCase("PROCESSING")) {
            order.setInchargeEmployee(staff);
            if (isApproved) {
                OrderStatus shippingStatus = orderStatusRepository.findById(3)
                        .orElseThrow(() -> new IllegalStateException("OrderStatus with ID 3 (SHIPPING) not found."));
                order.setOrderStatus(shippingStatus);
            } else {
                OrderStatus cancelledStatus = orderStatusRepository.findById(7)
                        .orElseThrow(() -> new IllegalStateException("OrderStatus with ID 7 (CANCELLED) not found."));
                order.setOrderStatus(cancelledStatus);
                returnStock(order);
            }
            orderRepository.save(order);

        } else {
            throw new IllegalStateException("Order must be in PENDING or PROCESSING status to be reviewed by staff.");
        }
    }


    public void confirmOrderReceived(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid order ID"));
        OrderStatus shippingStatus = orderStatusRepository.findByOrderStatusName("SHIPPING")
                .orElseThrow(() -> new IllegalStateException("Shipping status not found"));
        OrderStatus completedStatus = orderStatusRepository.findByOrderStatusName("COMPLETED")
                .orElseThrow(() -> new IllegalStateException("Completed status not found"));
        if (!order.getOrderStatus().equals(shippingStatus)) {
            throw new IllegalStateException("Order must be in SHIPPING status to confirm receipt.");
        }
        order.setOrderStatus(completedStatus);
        orderRepository.save(order);
    }

    private String buildOrderEmailBody(Order order, Set<OrderVariationSingle> orderVariationSingles, String headerMessage) {
        String logoUrl = "https://i.ibb.co/gbpkn23f/tab.png"; // Shop logo URL
        String primaryColor = "#62C0EE"; // Primary color of the email
        String accentColor = "#555"; // Secondary text color
        String facebookIconUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/2048px-2023_Facebook_icon.svg.png";
        String facebookUrl = "https://www.facebook.com/profile.php?id=61573783571056"; // URL to your Facebook page
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy"); // Define date format
        String formattedOrderDate = dateFormat.format(order.getOrderDate()); // Format order date

        StringBuilder body = new StringBuilder();
        body.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: ")
                .append(accentColor).append("; background-color: #ffffff; border-radius: 8px; border: 1px solid ")
                .append(primaryColor).append(";'>")

                // Header with Logo and Shop Name
                .append("<div style='text-align: center; padding: 20px; background-color: ").append(primaryColor)
                .append("; color: #ffffff;'>")
                .append("<img src='").append(logoUrl).append("' alt='Unleashed Logo' style='height: 45px; vertical-align: middle; margin-right: 10px;' />")
                .append("<span style='font-size: 24px; vertical-align: middle; font-weight: bold;'>Unleashed</span>")
                .append("</div>")

                // Greeting and Order Summary
                .append("<div style='padding: 20px;'>")
                .append("<p style='font-size: 16px; color: ").append(accentColor).append(";'><strong>Dear ")
                .append(order.getUser().getUserFullname()).append(",</strong></p>")
                .append("<p style='font-size: 16px; color: ").append(accentColor).append(";'>Thank you for shopping with Unleashed!</p>")
                .append("<p style='font-size: 16px; color: ").append(accentColor).append(";'>We are pleased to confirm your order <strong>#")
                .append(order.getOrderId()).append("</strong> placed on ").append(formattedOrderDate).append(".</p>")

                // Order Information Section
                .append("<h3 style='color: ").append(primaryColor).append("; font-size: 18px;'>Order Information:</h3>")
                .append("<ul style='list-style-type: none; padding: 0; color: ").append(accentColor).append(";'>")
                .append("<li><strong>Order ID:</strong> ").append(order.getOrderId()).append("</li>")
                .append("<li><strong>Order Date:</strong> ").append(order.getOrderDate()).append("</li>")
                .append("<li><strong>Payment Method:</strong> ").append(order.getPaymentMethod()).append("</li>")
                .append("<li><strong>Shipping Method:</strong> ").append(order.getShippingMethod()).append("</li>")
                .append("<li><strong>Total Amount:</strong> ").append(order.getOrderTotalAmount()).append(" VND</li>")
                .append("</ul>")

                // Product Details Section
                .append("<h3 style='color: ").append(primaryColor).append("; font-size: 18px;'>Product Details:</h3>")
                .append("<table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>")
                .append("<thead>")
                .append("<tr style='background-color: ").append(primaryColor).append("; color: #ffffff;'>")
                .append("<th style='padding: 8px; border: 1px solid ").append(primaryColor).append(";'>Product Name</th>")
                .append("<th style='padding: 8px; border: 1px solid ").append(primaryColor).append(";'>Size</th>")
                .append("<th style='padding: 8px; border: 1px solid ").append(primaryColor).append(";'>Color</th>")
                .append("<th style='padding: 8px; border: 1px solid ").append(primaryColor).append(";'>Quantity</th>")
                .append("<th style='padding: 8px; border: 1px solid ").append(primaryColor).append(";'>Unit Price</th>")
                .append("</tr>")
                .append("</thead>")
                .append("<tbody>");

        Set<Variation> productVariations = convertOrderDetailsToProductVariations(orderVariationSingles);
        if (!productVariations.isEmpty()) {
            for (Variation productVariation : productVariations) {
                int orderQuantity = getOrderQuantityForVariation(orderVariationSingles, String.valueOf(productVariation.getId()));

                body.append("<tr>")
                        .append("<td style='padding: 8px; border: 1px solid #ddd; color: ").append(accentColor).append(";'>").append(productVariation.getProduct().getProductName()).append("</td>")
                        .append("<td style='padding: 8px; border: 1px solid #ddd; color: ").append(accentColor).append(";'>").append(productVariation.getSize().getSizeName()).append("</td>")
                        .append("<td style='padding: 8px; border: 1px solid #ddd; color: ").append(accentColor).append(";'>").append(productVariation.getColor().getColorName()).append("</td>")
                        .append("<td style='padding: 8px; border: 1px solid #ddd; color: ").append(accentColor).append(";'>").append(orderQuantity).append("</td>")
                        .append("<td style='padding: 8px; border: 1px solid #ddd; color: ").append(accentColor).append(";'>").append(productVariation.getVariationPrice()).append(" VND</td>")
                        .append("</tr>");
            }
        } else {
            body.append("<tr><td colspan='5' style='padding: 8px; border: 1px solid #ddd; text-align: center; color: ").append(accentColor).append(";'>No products in this order.</td></tr>");
        }

        body.append("</tbody>")
                .append("</table>")

// Contact Section
                .append("<div style='text-align: center; padding: 10px;'>")
                .append("<p style='font-size: 16px; color: ").append(accentColor).append("; margin: 0 0 10px;'>")
                .append("If you have any questions about your order or need assistance, feel free to contact us:")
                .append("</p>")
                .append("<a href='").append(facebookUrl).append("' style='text-decoration: none;' target='_blank'>")
                .append("<img src='").append(facebookIconUrl).append("' alt='Facebook' style='width: 24px; height: 24px; margin: 5px 0;' />")
                .append("</a>")
                .append("</div>")

// Final Closing Message
                .append("<div style='text-align: center; padding: 10px;'>")
                .append("<p style='font-size: 16px; color: ").append(accentColor).append("; margin: 0;'>")
                .append("We appreciate your trust in us and look forward to delivering your order soon.")
                .append("</p>")
                .append("<p style='font-size: 16px; color: ").append(accentColor).append("; margin: 5px 0;'>")
                .append("Best regards,<br><strong>Unleashed Developer Team</strong>")
                .append("</p>")
                .append("</div>")

// Footer
                .append("<div style='text-align: center; background-color: ").append(primaryColor)
                .append("; color: #ffffff; padding: 10px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;'>")
                .append("<p style='margin: 0; font-size: 14px;'>© 2024 Unleashed</p>")
                .append("</div>")
                .append("</div>");

        return body.toString();
    }


    private String buildOrderCancellationEmailBody(Order order) {
        String logoUrl = "https://i.ibb.co/gbpkn23f/tab.png"; // Shop logo URL
        String primaryColor = "#62C0EE"; // Primary color of the email
        String accentColor = "#555"; // Secondary text color
        String facebookIconUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/2048px-2023_Facebook_icon.svg.png";
        String facebookUrl = "https://www.facebook.com/profile.php?id=61573783571056"; // URL to your Facebook page
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy"); // Define date format
        String formattedOrderDate = dateFormat.format(order.getOrderDate()); // Format order date

        String body = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: " +
                accentColor + "; background-color: #ffffff; border-radius: 8px; border: 1px solid " +
                primaryColor + ";'>" +

                // Header with Logo and Shop Name
                "<div style='text-align: center; padding: 20px; background-color: " + primaryColor +
                "; color: #ffffff;'>" +
                "<img src='" + logoUrl + "' alt='Unleashed Logo' style='height: 45px; vertical-align: middle; margin-right: 10px;' />" +
                "<span style='font-size: 24px; vertical-align: middle; font-weight: bold;'>Unleashed</span>" +
                "</div>" +

                // Greeting and Cancellation Notice
                "<div style='padding: 20px;'>" +
                "<p style='font-size: 16px; color: " + accentColor + ";'>" +
                "<strong>Dear " + order.getUser().getUserFullname() + ",</strong></p>" +
                "<p style='font-size: 16px; color: " + accentColor + ";'>Thank you for shopping with Unleashed!</p>" +
                "<p style='font-size: 16px; color: " + accentColor + ";'>We regret to inform you that your order <strong>#" +
                order.getOrderId() + "</strong> placed on " + formattedOrderDate +
                ", has been canceled.</p>" +

                // Apology Message
                "<p style='font-size: 16px; color: " + accentColor + ";'>" +
                "We sincerely apologize for any inconvenience caused and appreciate your understanding." +
                "</p>" +

                // Contact Section
                "<div style='text-align: center; padding: 10px;'>" +
                "<p style='font-size: 16px; color: " + accentColor + "; margin: 0 0 10px;'>" +
                "Please don’t hesitate to contact us:" +
                "</p>" +
                "<a href='" + facebookUrl + "' style='text-decoration: none;' target='_blank'>" +
                "<img src='" + facebookIconUrl + "' alt='Facebook' style='width: 24px; height: 24px; margin: 5px 0;' />" +
                "</a>" +
                "</div>" +

                // Closing Message
                "<div style='text-align: center; padding: 10px;'>" +
                "<p style='font-size: 16px; color: " + accentColor + "; margin: 0;'>" +
                "Thank you for choosing Unleashed. We look forward to serving you again in the future." +
                "</p>" +
                "<p style='font-size: 16px; color: " + accentColor + "; margin: 5px 0;'>" +
                "Best regards,<br><strong>Unleashed Developer Team</strong>" +
                "</p>" +
                "</div>" +

                // Footer
                "<div style='text-align: center; background-color: " + primaryColor +
                "; color: #ffffff; padding: 10px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;'>" +
                "<p style='margin: 0; font-size: 14px;'>© 2024 Unleashed</p>" +
                "</div>" +
                "</div>";

        return body;
    }

    private String buildPaymentCallbackEmailBody(Order order, String message) {
        String logoUrl = "https://i.ibb.co/gbpkn23f/tab.png"; // Shop logo URL
        String primaryColor = "#62C0EE"; // Primary color of the email
        String accentColor = "#555"; // Secondary text color
        String facebookIconUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/2048px-2023_Facebook_icon.svg.png";
        String facebookUrl = "https://www.facebook.com/profile.php?id=61573783571056"; // URL to your Facebook page
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy"); // Define date format
        String formattedOrderDate = dateFormat.format(order.getOrderDate()); // Format order date

        String body = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: " +
                accentColor + "; background-color: #ffffff; border-radius: 8px; border: 1px solid " +
                primaryColor + ";'>" +

                // Header with Logo and Shop Name
                "<div style='text-align: center; padding: 20px; background-color: " + primaryColor +
                "; color: #ffffff;'>" +
                "<img src='" + logoUrl + "' alt='Unleashed Logo' style='height: 45px; vertical-align: middle; margin-right: 10px;' />" +
                "<span style='font-size: 24px; vertical-align: middle; font-weight: bold;'>Unleashed</span>" +
                "</div>" +

                // Greeting and Message
                "<div style='padding: 20px;'>" +
                "<p style='font-size: 16px; color: " + accentColor + ";'><strong>Dear " +
                order.getUser().getUserFullname() + ",</strong></p>" +
                "<p style='font-size: 16px; color: " + accentColor + ";'>Thank you for shopping with Unleashed!</p>" +
                "<p style='font-size: 16px; color: " + accentColor + ";'>" + message + "</p>" +

                // Order Information
                "<h3 style='color: " + primaryColor + "; font-size: 18px;'>Order Information:</h3>" +
                "<ul style='list-style-type: none; padding: 0; color: " + accentColor + ";'>" +
                "<li><strong>Order ID:</strong> " + order.getOrderId() + "</li>" +
                "<li><strong>Order Date:</strong> " + formattedOrderDate + ".</p>" +
                "<li><strong>Total Amount:</strong> " + order.getOrderTotalAmount() + " VND</li>" +
                "</ul>" +

                // Contact and Footer
                "<div style='text-align: center; padding: 10px;'>" +
                "<p style='font-size: 16px; color: " + accentColor + ";'>" +
                "If you have any questions, please don't hesitate to contact us:" +
                "</p>" +
                "<a href='" + facebookUrl + "' style='text-decoration: none;' target='_blank'>" +
                "<img src='" + facebookIconUrl + "' alt='Facebook' style='width: 24px; height: 24px;' />" +
                "</a>" +
                "</div>" +
                "<div style='text-align: center; padding: 10px;'>" +
                "<p style='font-size: 16px; color: " + accentColor + ";'>" +
                "Best regards,<br><strong>Unleashed Developer Team</strong>" +
                "</p>" +
                "</div>" +
                "<div style='text-align: center; background-color: " + primaryColor +
                "; color: #ffffff; padding: 10px;'>" +
                "<p style='margin: 0; font-size: 14px;'>© 2024 Unleashed</p>" +
                "</div>" +
                "</div>";

        return body;
    }


    private Map<String, Object> buildOrderResponseJson(Order order) {
        Map<String, Object> orderJson = new HashMap<>();
        orderJson.put("orderId", order.getOrderId());
        orderJson.put("orderStatus", order.getOrderStatus().toString());
        orderJson.put("totalAmount", order.getOrderTotalAmount());

        List<Map<String, Object>> orderDetailsList = order.getOrderVariationSingles().stream()
                .map(this::buildOrderDetailJson)
                .collect(Collectors.toList());

        orderJson.put("orderDetails", orderDetailsList);
        return orderJson;
    }


    private Map<String, Object> buildOrderDetailJson(OrderVariationSingle detail) {
        Map<String, Object> detailJson = new HashMap<>();
        Variation variation = variationRepository.findById(detail.getId().getVariationSingleId()).orElse(null);

        if (variation != null && variation.getProduct() != null) {
            detailJson.put("productId", variation.getProduct().getProductId()); // Đảm bảo productId được thêm vào đây
            detailJson.put("productName", variation.getProduct().getProductName());
            detailJson.put("color", variation.getColor() != null ? variation.getColor().getColorName() : null);
            detailJson.put("size", variation.getSize() != null ? variation.getSize().getSizeName() : null);
//            detailJson.put("orderQuantity", detail.getOrderQuantity());
            detailJson.put("unitPrice", detail.getVariationPriceAtPurchase());
//            detailJson.put("voucherAmount", detail.getVoucher());
            detailJson.put("productImage", variation.getVariationImage());

            List<Map<String, Object>> reviews = reviewRepository.findReviewByProductId(UUID.fromString(variation.getProduct().getProductId().toString()))
                    .stream()
                    .map(reviewData -> {
                        Map<String, Object> reviewJson = new HashMap<>();
                        reviewJson.put("reviewId", reviewData[0]);
                        reviewJson.put("productId", reviewData[4]); // Bao gồm productId
                        reviewJson.put("fullName", reviewData[1]);
                        reviewJson.put("reviewRating", reviewData[2]);
                        reviewJson.put("reviewComment", reviewData[3]);
                        reviewJson.put("createdAt", reviewData[5]);
                        return reviewJson;
                    })
                    .collect(Collectors.toList());

            detailJson.put("reviews", reviews);
        } else {
            detailJson.put("productId", null); // Nếu không có ProductVariation hoặc Product
            detailJson.put("productName", null);
            detailJson.put("color", null);
            detailJson.put("size", null);
//            detailJson.put("orderQuantity", detail.getOrderQuantity());
            detailJson.put("unitPrice", detail.getVariationPriceAtPurchase());
//            detailJson.put("voucherAmount", detail.getVoucherAmount());
            detailJson.put("productImage", null);
            detailJson.put("reviews", Collections.emptyList());
        }

        return detailJson;
    }


    private String generateTrackingNumber() {
        String prefix = "TN";
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder trackingNumber = new StringBuilder(prefix);
        Random random = new Random();

        for (int i = 0; i < 8; i++) {
            trackingNumber.append(characters.charAt(random.nextInt(characters.length())));
        }
        return trackingNumber.toString();
    }

    @Transactional
    public void returnOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid order ID: " + orderId));

        OrderStatus returningStatus = orderStatusRepository.findById(9)
                .orElseThrow(() -> new IllegalStateException("OrderStatus with ID 9 (RETURNING) not found."));
        OrderStatus shippingStatus = orderStatusRepository.findByOrderStatusName("SHIPPING")
                .orElseThrow(() -> new IllegalStateException("Shipping status not found"));
        OrderStatus completedStatus = orderStatusRepository.findByOrderStatusName("COMPLETED")
                .orElseThrow(() -> new IllegalStateException("Completed status not found"));

        OffsetDateTime orderDate = order.getOrderDate();
        OffsetDateTime thirtyDaysAgo = OffsetDateTime.now().minusDays(30);

        if (orderDate.isBefore(thirtyDaysAgo)) {
            throw new IllegalStateException("Cannot return an order that is more than 30 days old.");
        }

        if (!order.getOrderStatus().getOrderStatusName().equals("SHIPPING") &&
                !order.getOrderStatus().getOrderStatusName().equals("COMPLETED")) {
            throw new IllegalStateException("Cannot return an order that is not in COMPLETED or SHIPPING status.");
        }

        order.setOrderStatus(returningStatus);
        orderRepository.save(order);
        sendOrderReturnEmail(order);
    }


    private void sendOrderReturnEmail(Order order) {
        String subject = "Order Return Requested - Order #" + order.getOrderId();
        String body = buildOrderReturnEmailBody(order, order.getOrderVariationSingles(), "Your return order has been requested successfully!");  //Pass orderDetails
        emailService.sendHtmlMessage(order.getUser().getUserEmail(), subject, body);
    }


    private String buildOrderReturnEmailBody(Order order, Set<OrderVariationSingle> orderVariationSingles, String headerMessage) {
        String logoUrl = "https://i.ibb.co/gbpkn23f/tab.png";
        String primaryColor = "#62C0EE";
        String accentColor = "#555";
        String facebookIconUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/2023_Facebook_icon.svg/2048px-2023_Facebook_icon.svg.png";
        String facebookUrl = "https://www.facebook.com/profile.php?id=61573783571056";

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
        String formattedOrderDate = dateFormatter.format(order.getOrderDate());
        DateTimeFormatter expectedDeliveryDateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneId.systemDefault());
        String formattedExpectedDeliveryDate = (order.getOrderExpectedDeliveryDate() != null)
                ? expectedDeliveryDateFormatter.format(order.getOrderExpectedDeliveryDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate())
                : "N/A";

        StringBuilder body = new StringBuilder();
        body.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: ")
                .append(accentColor).append("; background-color: #ffffff; border-radius: 8px; border: 1px solid ")
                .append(primaryColor).append(";'>")
                .append("<div style='text-align: center; padding: 20px; background-color: ").append(primaryColor)
                .append("; color: #ffffff;'>")
                .append("<img src='").append(logoUrl).append("' alt='Unleashed Logo' style='height: 45px; vertical-align: middle; margin-right: 10px;' />")
                .append("<span style='font-size: 24px; vertical-align: middle; font-weight: bold;'>Unleashed</span>")
                .append("</div>")
                .append("<div style='padding: 20px;'>")
                .append("<p style='font-size: 16px; color: ").append(accentColor).append(";'><strong>Dear ")
                .append(order.getUser().getUserFullname()).append(",</strong></p>")
                .append("<p style='font-size: 16px; color: ").append(accentColor).append(";'>Thank you for shopping with Unleashed!</p>")
                .append("<p style='font-size: 16px; color: ").append(accentColor).append(";'>We have received your return request for order <strong>#")
                .append(order.getOrderId()).append("</strong> placed on ").append(formattedOrderDate).append(".</p>")
                .append("<h3 style='color: ").append(primaryColor).append("; font-size: 18px;'>Order Information:</h3>")
                .append("<ul style='list-style-type: none; padding: 0; color: ").append(accentColor).append(";'>")
                .append("<li><strong>Order ID:</strong> ").append(order.getOrderId()).append("</li>")
                .append("<li><strong>Order Date:</strong> ").append(formattedOrderDate).append("</li>")
                .append("<li><strong>Payment Method:</strong> ").append(order.getPaymentMethod().getPaymentMethodName()).append("</li>")
                .append("<li><strong>Shipping Method:</strong> ").append(order.getShippingMethod().getShippingMethodName()).append("</li>")
                .append("<li><strong>Total Amount:</strong> ").append(order.getOrderTotalAmount()).append(" VND</li>")
                .append("<li><strong>Expected Delivery Date:</strong> ").append(formattedExpectedDeliveryDate).append("</li>")
                .append("</ul>")
                .append("<h3 style='color: ").append(primaryColor).append("; font-size: 18px;'>Product Details:</h3>")
                .append("<table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>")
                .append("<thead>")
                .append("<tr style='background-color: ").append(primaryColor).append("; color: #ffffff;'>")
                .append("<th style='padding: 8px; border: 1px solid ").append(primaryColor).append(";'>Product Name</th>")
                .append("<th style='padding: 8px; border: 1px solid ").append(primaryColor).append(";'>Size</th>")
                .append("<th style='padding: 8px; border: 1px solid ").append(primaryColor).append(";'>Color</th>")
                .append("<th style='padding: 8px; border: 1px solid ").append(primaryColor).append(";'>Quantity</th>")
                .append("<th style='padding: 8px; border: 1px solid ").append(primaryColor).append(";'>Unit Price</th>")
                .append("</tr>")
                .append("</thead>")
                .append("<tbody>");

        if (!orderVariationSingles.isEmpty()) {
            Map<Variation, Long> variationQuantityMap = orderVariationSingles.stream()
                    .collect(Collectors.groupingBy(
                            ovs -> ovs.getVariationSingle().getVariation(),
                            Collectors.counting()
                    ));

            Map<Integer, BigDecimal> priceMap = orderVariationSingles.stream()
                    .collect(Collectors.toMap(
                            ovs -> ovs.getVariationSingle().getVariation().getId(),
                            OrderVariationSingle::getVariationPriceAtPurchase,
                            (price1, price2) -> price1
                    ));

            for (Map.Entry<Variation, Long> entry : variationQuantityMap.entrySet()) {
                Variation variation = entry.getKey();
                Long quantity = entry.getValue();
                BigDecimal unitPrice = priceMap.getOrDefault(variation.getId(), BigDecimal.ZERO);

                body.append("<tr>")
                        .append("<td style='padding: 8px; border: 1px solid #ddd; color: ").append(accentColor).append(";'>").append(variation.getProduct().getProductName()).append("</td>")
                        .append("<td style='padding: 8px; border: 1px solid #ddd; color: ").append(accentColor).append(";'>").append(variation.getSize().getSizeName()).append("</td>")
                        .append("<td style='padding: 8px; border: 1px solid #ddd; color: ").append(accentColor).append(";'>").append(variation.getColor().getColorName()).append("</td>")
                        .append("<td style='padding: 8px; border: 1px solid #ddd; color: ").append(accentColor).append(";'>").append(quantity).append("</td>")
                        .append("<td style='padding: 8px; border: 1px solid #ddd; color: ").append(accentColor).append(";'>").append(unitPrice).append(" VND</td>")
                        .append("</tr>");
            }
        } else {
            body.append("<tr><td colspan='5' style='padding: 8px; border: 1px solid #ddd; text-align: center; color: ").append(accentColor).append(";'>No products in this order.</td></tr>");
        }

        body.append("</tbody>")
                .append("</table>")
                .append("<div style='text-align: center; padding: 10px;'>")
                .append("<p style='font-size: 16px; color: ").append(accentColor).append("; margin: 0 0 10px;'>")
                .append("If you have any questions about your return or need assistance, feel free to contact us:")
                .append("</p>")
                .append("<a href='").append(facebookUrl).append("' style='text-decoration: none;' target='_blank'>")
                .append("<img src='").append(facebookIconUrl).append("' alt='Facebook' style='width: 24px; height: 24px; margin: 5px 0;' />")
                .append("</a>")
                .append("</div>")
                .append("<div style='text-align: center; padding: 10px;'>")
                .append("<p style='font-size: 16px; color: ").append(accentColor).append("; margin: 0;'>")
                .append("We appreciate your understanding and look forward to serving you again.")
                .append("</p>")
                .append("<p style='font-size: 16px; color: ").append(accentColor).append("; margin: 5px 0;'>")
                .append("Best regards,<br><strong>Unleashed Developer Team</strong>")
                .append("</p>")
                .append("</div>")
                .append("<div style='text-align: center; background-color: ").append(primaryColor)
                .append("; color: #ffffff; padding: 10px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;'>")
                .append("<p style='margin: 0; font-size: 14px;'>© 2024 Unleashed</p>")
                .append("</div>")
                .append("</div>");

        return body.toString();
    }

    @Transactional
    public void inspectOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid order ID: " + orderId));

        OrderStatus returningStatus = orderStatusRepository.findByOrderStatusName("RETURNING")
                .orElseThrow(() -> new IllegalStateException("Returning status not found"));

        if (!order.getOrderStatus().getOrderStatusName().equals("RETURNING")) {
            throw new IllegalStateException("Cannot return an order that is not in RETURNING status.");
        }

        OrderStatus inspectionStatus = orderStatusRepository.findById(8)
                .orElseThrow(() -> new IllegalStateException("OrderStatus with ID 8 (INSPECTION) not found."));

        order.setOrderStatus(inspectionStatus);
        orderRepository.save(order);
    }

    @Transactional
    public void orderReturned(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid order ID: " + orderId));

        OrderStatus status = orderStatusRepository.findByOrderStatusName("INSPECTION")
                .orElseThrow(() -> new IllegalStateException("Inspection status not found"));

        if (!order.getOrderStatus().getOrderStatusName().equals("INSPECTION")) {
            throw new IllegalStateException("Cannot return an order that is not in RETURNING status.");
        }

        OrderStatus returnStatus = orderStatusRepository.findById(6)
                .orElseThrow(() -> new IllegalStateException("OrderStatus with ID 6 (RETURNED) not found."));

        order.setOrderStatus(returnStatus);
        orderRepository.save(order);
        returnStock(order);

    }

    private void returnStock(Order order) {
        stockTransactionService.createReturnTransactionsForOrder(order);
    }


    @Transactional
    public void checkStockAvailability(OrderDTO orderDTO) {
        for (com.unleashed.dto.OrderDetailDTO detail : orderDTO.getOrderDetails()) {
            Integer availableStock = stockVariationRepository.findStockProductByProductVariationId(detail.getVariationId());
            if (availableStock == null || availableStock < detail.getOrderQuantity()) {
                Variation variation = variationRepository.findById(detail.getVariationId()).orElse(null);

                String productName = "a product";
                String color = "";
                String size = "";

                if (variation != null) {
                    productName = "'" + variation.getProduct().getProductName() + "'";
                    color = variation.getColor().getColorName();
                    size = variation.getSize().getSizeName();
                }

                int stockOnHand = availableStock != null ? availableStock : 0;

                String errorMessage;
                if (stockOnHand > 0) {
                    errorMessage = "Sorry, we only have " + stockOnHand + " of " + productName + " (" + color + ", " + size + ") left in stock.";
                } else {
                    errorMessage = "Sorry, " + productName + " (" + color + ", " + size + ") is currently out of stock.";
                }
                throw new IllegalStateException(errorMessage);
            }
        }
    }


}
