//package com.unleashed.Service;
//
//import com.unleashed.dto.OrderDTO;
//import com.unleashed.entity.*;
//import com.unleashed.entity.ComposeKey.OrderVariationSingleId;
//import com.unleashed.entity.ComposeKey.StockVariationId;
//import com.unleashed.repo.*;
//import com.unleashed.service.CartService;
//import com.unleashed.service.EmailService;
//import com.unleashed.service.OrderService;
//import com.unleashed.service.VNPayService;
//import com.unleashed.service.OrderDetailService;
//import com.unleashed.service.ProductVariationService;
//import com.unleashed.service.VoucherService;
//import com.unleashed.service.RankService;
//import jakarta.servlet.http.HttpServletRequest;
//import lombok.extern.slf4j.Slf4j;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.data.domain.*;
//import org.springframework.mock.web.MockHttpServletRequest;
//
//import java.math.BigDecimal;
//import java.time.OffsetDateTime;
//import java.util.*;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@Slf4j
//@SpringBootTest
//@AutoConfigureMockMvc
//public class OrderServiceTest {
//
//    @Autowired
//    private OrderService orderService;
//
//    @MockBean
//    private OrderRepository orderRepository;
//    @MockBean
//    private ProductRepository productRepository;
//    @MockBean
//    private VariationSingleRepository variationSingleRepository;
//    @MockBean
//    private OrderVariationSingleRepository orderVariationSingleRepository;
//    @MockBean
//    private CartService cartService;
//    @MockBean
//    private VNPayService vnPayService;
//    @MockBean
//    private EmailService emailService;
//    @MockBean
//    private OrderDetailService orderDetailService;
//    @MockBean
//    private ProductVariationService productVariationService;
//    @MockBean
//    private VariationRepository variationRepository;
//    @MockBean
//    private UserRepository userRepository;
//    @MockBean
//    private VoucherService voucherService;
//    @MockBean
//    private OrderStatusRepository orderStatusRepository;
//    @MockBean
//    private RankService rankService;
//    @MockBean
//    private StockVariationRepository stockVariationRepository;
//    @MockBean
//    private ReviewRepository reviewRepository;
//
//    private List<Order> orders;
//    private User user;
//    private OrderStatus orderStatusPending, orderStatusProcessing, orderStatusShipping, orderStatusCompleted, orderStatusCancelled, orderStatusReturned, orderStatusReturning, orderStatusInspection;
//    private PaymentMethod paymentMethodVNPay, paymentMethodCOD;
//    private ShippingMethod shippingMethodStandard, shippingMethodExpress;
//    private VariationSingle variationSingle1, variationSingle2;
//    private Variation variation1, variation2;
//    private Product product1, product2;
//    private Color colorRed, colorBlue;
//    private Size sizeS, sizeM;
//    private StockVariation stockVariation1, stockVariation2;
//    private Voucher voucher;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//        setupMockData();
//    }
//
//    private void setupMockData() {
//        user = createUser("user123", "testuser", "Test User", "test@example.com", "123-456-7890");
//        orderStatusPending = createOrderStatus(1, "PENDING");
//        orderStatusProcessing = createOrderStatus(2, "PROCESSING");
//        orderStatusShipping = createOrderStatus(3, "SHIPPING");
//        orderStatusCompleted = createOrderStatus(4, "COMPLETED");
//        orderStatusCancelled = createOrderStatus(5, "CANCELLED");
//        orderStatusReturned = createOrderStatus(6, "RETURNED");
//        orderStatusReturning = createOrderStatus(9, "RETURNING");
//        orderStatusInspection = createOrderStatus(8, "INSPECTION");
//
//        paymentMethodVNPay = createPaymentMethod(1, "VNPAY");
//        paymentMethodCOD = createPaymentMethod(2, "COD");
//        shippingMethodStandard = createShippingMethod(1, "STANDARD");
//        shippingMethodExpress = createShippingMethod(2, "EXPRESS");
//
//        product1 = createProduct("PROD1", "Product 1");
//        product2 = createProduct("PROD2", "Product 2");
//        colorRed = createColor(1, "Red", "#FF0000");
//        colorBlue = createColor(2, "Blue", "#0000FF");
//        sizeS = createSize(1, "S");
//        sizeM = createSize(2, "M");
//
//        variation1 = createVariation(1, product1, colorRed, sizeS, BigDecimal.valueOf(50), "image1.jpg");
//        variation2 = createVariation(2, product2, colorBlue, sizeM, BigDecimal.valueOf(75), "image2.jpg");
//
//        variationSingle1 = createVariationSingle(1, variation1, "PROD1-RED-S-123456", false);
//        variationSingle2 = createVariationSingle(2, variation2, "PROD2-BLUE-M-654321", false);
//
////        stockVariation1 = createStockVariation(variation1, 100);
////        stockVariation2 = createStockVariation(variation2, 50);
//        voucher = createVoucher();
//
//        orders = Arrays.asList(
//                createOrder("ORD001", user, orderStatusPending, paymentMethodVNPay, shippingMethodStandard, BigDecimal.valueOf(100)),
//                createOrder("ORD002", user, orderStatusProcessing, paymentMethodCOD, shippingMethodExpress, BigDecimal.valueOf(200))
//        );
//    }
//
//
//    // Helper methods to create mock entities
//    private User createUser(String userId, String username, String fullname, String email, String phone) {
//        User user = new User();
//        user.setUserId(userId);
//        user.setUserUsername(username);
//        user.setUserFullname(fullname);
//        user.setUserEmail(email);
//        user.setUserPhone(phone);
//        return user;
//    }
//
//    private OrderStatus createOrderStatus(Integer id, String name) {
//        OrderStatus orderStatus = new OrderStatus();
//        orderStatus.setId(id);
//        orderStatus.setOrderStatusName(name);
//        return orderStatus;
//    }
//
//    private PaymentMethod createPaymentMethod(Integer id, String name) {
//        PaymentMethod paymentMethod = new PaymentMethod();
//        paymentMethod.setId(id);
//        paymentMethod.setPaymentMethodName(name);
//        return paymentMethod;
//    }
//
//    private ShippingMethod createShippingMethod(Integer id, String name) {
//        ShippingMethod shippingMethod = new ShippingMethod();
//        shippingMethod.setId(id);
//        shippingMethod.setShippingMethodName(name);
//        return shippingMethod;
//    }
//    private Product createProduct(String productCode, String productName) {
//        Product product = new Product();
//        product.setProductCode(productCode);
//        product.setProductName(productName);
//        return product;
//    }
//    private Color createColor(Integer id, String name, String hexCode) {
//        Color color = new Color();
//        color.setId(id);
//        color.setColorName(name);
//        color.setColorHexCode(hexCode);
//        return color;
//    }
//    private Size createSize(Integer id, String name) {
//        Size size = new Size();
//        size.setId(id);
//        size.setSizeName(name);
//        return size;
//    }
//
//    private Variation createVariation(Integer id, Product product, Color color, Size size, BigDecimal price, String image) {
//        return Variation.builder()
//                .id(id)
//                .product(product)
//                .color(color)
//                .size(size)
//                .variationPrice(price)
//                .variationImage(image)
//                .build();
//    }
//
//    private VariationSingle createVariationSingle(Integer id, Variation variation, String code, boolean isBought) {
//        return VariationSingle.builder()
//                .id(id)
//                .variationSingleCode(code)
//                .isVariationSingleBought(isBought)
//                .productCodeForVariationSingle(variation.getProduct().getProductCode())
//                .colorNameForVariationSingle(variation.getColor().getColorName())
//                .sizeNameForVariationSingle(variation.getSize().getSizeName())
//                .build();
//    }
//
//
////    private StockVariation createStockVariation(Variation variation, int quantity) {
////        StockVariation stockVariation = new StockVariation();
////        stockVariation.setId(new StockVariationId(1, variation.getId())); // Assuming stock ID is 1
////        stockVariation.setStockQuantity(quantity);
////        return stockVariation;
////    }
//
//    private Voucher createVoucher() {
//        return new Voucher(); // Set properties if needed
//    }
//
//
//    private Order createOrder(String orderId, User user, OrderStatus orderStatus, PaymentMethod paymentMethod, ShippingMethod shippingMethod, BigDecimal totalAmount) {
//        return Order.builder()
//                .orderId(orderId)
//                .user(user)
//                .orderStatus(orderStatus)
//                .paymentMethod(paymentMethod)
//                .shippingMethod(shippingMethod)
//                .orderTotalAmount(totalAmount)
//                .orderDate(OffsetDateTime.now())
//                .build();
//    }
//
//    private OrderDTO createValidOrderDTO() {
//        OrderDTO orderDTO = new OrderDTO();
//        orderDTO.setUserId(user.getUserId());
//        orderDTO.setPaymentMethod(paymentMethodVNPay);
//        orderDTO.setShippingMethod(shippingMethodStandard);
//        orderDTO.setTotalAmount(100.00);
//        orderDTO.setBillingAddress("Test Address");
//        orderDTO.setOrderDetails(Collections.emptyList()); // Add order details if needed
//        return orderDTO;
//    }
//
////    @Test
////    void getOrderById_ExistingOrderId_ShouldReturnOrderMap() {
////        String orderId = "ORD001";
////        Order order = orders.get(0);
////        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
////        when(orderVariationSingleRepository.findById_OrderId(orderId)).thenReturn(Collections.emptyList());
////        when(variationSingleRepository.findByVariationSingleIds(anyList())).thenReturn(Collections.emptyList());
////
////        Optional<Map<String, Object>> result = orderService.getOrderById(orderId);
////
////        assertTrue(result.isPresent());
////        assertEquals(orderId, result.get().get("orderId"));
////        verify(orderRepository, times(1)).findById(orderId);
////    }
//
//    @Test
//    void getOrderById_NonExistingOrderId_ShouldReturnEmptyOptional() {
//        String orderId = "ORD999";
//        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());
//
//        Optional<Map<String, Object>> result = orderService.getOrderById(orderId);
//
//        assertFalse(result.isPresent());
//        verify(orderRepository, times(1)).findById(orderId);
//    }
//
////    @Test
////    void getOrdersByUserId_ExistingUserId_ShouldReturnOrderMapPage() {
////        String userId = user.getUserId();
////        Pageable pageable = Pageable.unpaged();
////        Page<Order> orderPage = new PageImpl<>(orders);
////
////        when(userRepository.findByUserId(userId)).thenReturn(Optional.of(user)); // Mock find user by ID
////        when(orderRepository.findByUserId(userId, pageable)).thenReturn(orderPage);
////        when(orderVariationSingleRepository.findById_OrderId(anyString())).thenReturn(Collections.emptyList());
////        when(variationSingleRepository.findByVariationSingleIds(anyList())).thenReturn(Collections.emptyList());
////
////        Map<String, Object> result = orderService.getOrdersByUserId(userId, pageable);
////
////        assertNotNull(result);
////        assertTrue(result.containsKey("orders"));
////        assertEquals(2, ((List<?>)result.get("orders")).size());
////        verify(orderRepository, times(1)).findByUserId(userId, pageable);
////    }
//
////    @Test
////    void getOrdersByUserId_NonExistingUserId_ShouldReturnEmptyOrderList() {
////        String userId = "nonExistingUser";
////        Pageable pageable = Pageable.unpaged();
////        Page<Order> emptyOrderPage = Page.empty();
////
////        when(orderRepository.findByUserId(userId, pageable)).thenReturn(emptyOrderPage);
////
////        Map<String, Object> result = orderService.getOrdersByUserId(userId, pageable);
////
////        assertNotNull(result);
////        assertTrue(result.containsKey("orders"));
////        assertTrue(((List<?>)result.get("orders")).isEmpty());
////        verify(orderRepository, times(1)).findByUserId(userId, pageable);
////    }
//
//
////    @Test
////    void createOrder_ValidOrderDTO_ShouldReturnOrderResponse() throws Exception {
////        OrderDTO orderDTO = createValidOrderDTO();
////        Order savedOrder = createOrder("ORD003", user, orderStatusPending, paymentMethodVNPay, shippingMethodStandard, BigDecimal.valueOf(100));
////
////        when(userRepository.findById(orderDTO.getUserId())).thenReturn(Optional.of(user));
////        when(orderStatusRepository.findById(1)).thenReturn(Optional.of(orderStatusPending));
////        when(orderRepository.saveAndFlush(any(Order.class))).thenReturn(savedOrder);
////        when(variationRepository.findById(any())).thenReturn(Optional.of(variation1));
////        when(variationSingleRepository.save(any(VariationSingle.class))).thenReturn(variationSingle1);
////        when(orderVariationSingleRepository.save(any(OrderVariationSingle.class))).thenReturn(OrderVariationSingle.builder().build());
////        when(stockVariationRepository.findByVariationId(any())).thenReturn(Collections.singletonList(stockVariation1));
////        when(cartService.removeAllFromCart(any())).thenReturn(null);
////
////
////        Map<String, Object> response = orderService.createOrder(orderDTO, new MockHttpServletRequest());
////
////        assertNotNull(response);
////        assertEquals("ORD003", response.get("orderId"));
////        verify(orderRepository, times(1)).saveAndFlush(any(Order.class));
////    }
//
//    @Test
//    void createOrder_InvalidOrderDTO_ShouldThrowException() {
//        OrderDTO orderDTO = new OrderDTO(); // Invalid DTO, missing details
//
//        assertThrows(NullPointerException.class, () -> orderService.createOrder(orderDTO, new MockHttpServletRequest()));
//        verify(orderRepository, never()).save(any(Order.class));
//    }
//
//
////    @Test
////    void cancelOrder_PendingOrderStatus_ShouldCancelOrderSuccessfully() {
////        Order order = orders.get(0); // Order with PENDING status
////        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
////        when(orderStatusRepository.findById(5)).thenReturn(Optional.of(orderStatusCancelled)); // CANCELLED status
////        when(orderStatusRepository.findByOrderStatusName(any())).thenReturn(Optional.of(orderStatusCancelled)); // For returnStock
////        doNothing().when(orderRepository).save(any(Order.class));
////        when(orderVariationSingleRepository.findByOrderId(order.getOrderId())).thenReturn(Collections.emptyList());
////        when(variationSingleRepository.findById(any())).thenReturn(Optional.of(variationSingle1));
////        when(variationRepository.findByProduct_ProductCodeAndColor_ColorNameAndSize_SizeName(any(),any(),any())).thenReturn(Optional.of(variation1));
////        when(stockVariationRepository.findByVariationId(any())).thenReturn(Collections.singletonList(stockVariation1));
////        when(stockVariationRepository.save(any())).thenReturn(stockVariation1);
////
////
////        assertDoesNotThrow(() -> orderService.cancelOrder(order.getOrderId()));
////        assertEquals("CANCELLED", order.getOrderStatus().getOrderStatusName());
////        verify(orderRepository, times(1)).save(any(Order.class));
////    }
//
//    @Test
//    void cancelOrder_NonPendingOrderStatus_ShouldThrowException() {
//        Order order = orders.get(1); // Order with PROCESSING status
//        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
//
//        assertThrows(IllegalStateException.class, () -> orderService.cancelOrder(order.getOrderId()));
//        verify(orderRepository, never()).save(any(Order.class));
//    }
//
//    @Test
//    void cancelOrder_OrderNotFound_ShouldThrowException() {
//        String orderId = "ORD999";
//        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());
//
//        assertThrows(IllegalArgumentException.class, () -> orderService.cancelOrder(orderId));
//        verify(orderRepository, never()).save(any(Order.class));
//    }
//
//
//    @Test
//    void reviewOrderByStaff_PendingOrderApproved_ShouldSetToProcessing() {
//        Order order = orders.get(0); // PENDING order
//        User staff = createUser("staff123", "staffuser", "Staff User", "staff@example.com", "987-654-3210");
//
//        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
//        when(userRepository.findByUserUsername("staffuser")).thenReturn(Optional.of(staff));
//        when(orderStatusRepository.findById(2)).thenReturn(Optional.of(orderStatusProcessing)); // PROCESSING status
//
//        assertDoesNotThrow(() -> orderService.reviewOrderByStaff(order.getOrderId(), "staffuser", true));
//        assertEquals("PROCESSING", order.getOrderStatus().getOrderStatusName());
//        assertEquals(staff, order.getInchargeEmployee());
//        verify(orderRepository, times(1)).save(any(Order.class));
//    }
//
////    @Test
////    void reviewOrderByStaff_PendingOrderRejected_ShouldSetToReturned() {
////        Order order = orders.get(0); // PENDING order
////        User staff = createUser("staff123", "staffuser", "Staff User", "staff@example.com", "987-654-3210");
////
////        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
////        when(userRepository.findByUserUsername("staffuser")).thenReturn(Optional.of(staff));
////        when(orderStatusRepository.findById(7)).thenReturn(Optional.of(orderStatusReturned)); // RETURNED status
////        when(orderStatusRepository.findByOrderStatusName(any())).thenReturn(Optional.of(orderStatusReturned)); // For returnStock
////        doNothing().when(orderRepository).save(any(Order.class));
////        when(orderVariationSingleRepository.findByOrderId(order.getOrderId())).thenReturn(Collections.emptyList());
////        when(variationSingleRepository.findById(any())).thenReturn(Optional.of(variationSingle1));
////        when(variationRepository.findByProduct_ProductCodeAndColor_ColorNameAndSize_SizeName(any(),any(),any())).thenReturn(Optional.of(variation1));
////        when(stockVariationRepository.findByVariationId(any())).thenReturn(Collections.singletonList(stockVariation1));
////        when(stockVariationRepository.save(any())).thenReturn(stockVariation1);
////
////
////        assertDoesNotThrow(() -> orderService.reviewOrderByStaff(order.getOrderId(), "staffuser", false));
////        assertEquals("RETURNED", order.getOrderStatus().getOrderStatusName());
////        assertEquals(staff, order.getInchargeEmployee());
////        verify(orderRepository, times(1)).save(any(Order.class));
////    }
//
//    @Test
//    void reviewOrderByStaff_NonPendingOrder_ShouldThrowException() {
//        Order order = orders.get(1); // PROCESSING order
//        User staff = createUser("staff123", "staffuser", "Staff User", "staff@example.com", "987-654-3210");
//
//        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
//        when(userRepository.findByUserUsername("staffuser")).thenReturn(Optional.of(staff));
//
//        assertThrows(IllegalStateException.class, () -> orderService.reviewOrderByStaff(order.getOrderId(), "staffuser", true));
//        verify(orderRepository, never()).save(any(Order.class));
//    }
//
//
//    @Test
//    void confirmOrderReceived_ShippingOrder_ShouldSetToCompleted() {
//        Order order = createOrder("ORD003", user, orderStatusShipping, paymentMethodVNPay, shippingMethodStandard, BigDecimal.valueOf(150)); // SHIPPING order
//        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
//        when(orderStatusRepository.findByOrderStatusName("SHIPPING")).thenReturn(Optional.of(orderStatusShipping));
//        when(orderStatusRepository.findByOrderStatusName("COMPLETED")).thenReturn(Optional.of(orderStatusCompleted));
//        when(rankService.hasRegistered(user)).thenReturn(false); // Mock rank service behavior
//
//        assertDoesNotThrow(() -> orderService.confirmOrderReceived(order.getOrderId()));
//        assertEquals("COMPLETED", order.getOrderStatus().getOrderStatusName());
//        verify(orderRepository, times(1)).save(any(Order.class));
//    }
//
//    @Test
//    void confirmOrderReceived_NonShippingOrder_ShouldThrowException() {
//        Order order = orders.get(0); // PENDING order
//        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
//        when(orderStatusRepository.findByOrderStatusName("SHIPPING")).thenReturn(Optional.of(orderStatusShipping));
//
//        assertThrows(IllegalStateException.class, () -> orderService.confirmOrderReceived(order.getOrderId()));
//        verify(orderRepository, never()).save(any(Order.class));
//    }
//
//    @Test
//    void confirmOrderReceived_OrderNotFound_ShouldThrowException() {
//        String orderId = "ORD999";
//        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());
//
//        assertThrows(IllegalArgumentException.class, () -> orderService.confirmOrderReceived(orderId));
//        verify(orderRepository, never()).save(any(Order.class));
//    }
//
//
////    @Test
////    void returnOrder_CompletedOrderWithin30Days_ShouldSetToReturning() {
////        Order order = createOrder("ORD003", user, orderStatusCompleted, paymentMethodVNPay, shippingMethodStandard, BigDecimal.valueOf(150)); // COMPLETED order
////        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
////        when(orderStatusRepository.findByOrderStatusName("COMPLETED")).thenReturn(Optional.of(orderStatusCompleted));
////        when(orderStatusRepository.findByOrderStatusName("SHIPPING")).thenReturn(Optional.of(orderStatusShipping));
////        when(orderStatusRepository.findById(9)).thenReturn(Optional.of(orderStatusReturning)); // RETURNING status
////
////        assertDoesNotThrow(() -> orderService.returnOrder(order.getOrderId()));
////        assertEquals("RETURNING", order.getOrderStatus().getOrderStatusName());
////        verify(orderRepository, times(1)).save(any(Order.class));
////    }
//
////    @Test
////    void returnOrder_ShippingOrderWithin30Days_ShouldSetToReturning() {
////        Order order = createOrder("ORD003", user, orderStatusShipping, paymentMethodVNPay, shippingMethodStandard, BigDecimal.valueOf(150)); // SHIPPING order
////        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
////        when(orderStatusRepository.findByOrderStatusName("COMPLETED")).thenReturn(Optional.of(orderStatusCompleted));
////        when(orderStatusRepository.findByOrderStatusName("SHIPPING")).thenReturn(Optional.of(orderStatusShipping));
////        when(orderStatusRepository.findById(9)).thenReturn(Optional.of(orderStatusReturning)); // RETURNING status
////
////        assertDoesNotThrow(() -> orderService.returnOrder(order.getOrderId()));
////        assertEquals("RETURNING", order.getOrderStatus().getOrderStatusName());
////        verify(orderRepository, times(1)).save(any(Order.class));
////    }
//
//
//    @Test
//    void returnOrder_OrderOlderThan30Days_ShouldThrowException() {
//        Order order = createOrder("ORD003", user, orderStatusCompleted, paymentMethodVNPay, shippingMethodStandard, BigDecimal.valueOf(150));
//        order.setOrderDate(OffsetDateTime.now().minusDays(31)); // Set order date older than 30 days
//        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
//
//        assertThrows(IllegalStateException.class, () -> orderService.returnOrder(order.getOrderId()));
//        verify(orderRepository, never()).save(any(Order.class));
//    }
//
//    @Test
//    void returnOrder_NonCompletedNonShippingOrder_ShouldThrowException() {
//        Order order = orders.get(0); // PENDING order
//        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
//        when(orderStatusRepository.findByOrderStatusName("SHIPPING")).thenReturn(Optional.of(orderStatusShipping));
//        when(orderStatusRepository.findByOrderStatusName("COMPLETED")).thenReturn(Optional.of(orderStatusCompleted));
//
//
//        assertThrows(IllegalStateException.class, () -> orderService.returnOrder(order.getOrderId()));
//        verify(orderRepository, never()).save(any(Order.class));
//    }
//
//    @Test
//    void inspectOrder_ReturningOrder_ShouldSetToInspection() {
//        Order order = createOrder("ORD003", user, orderStatusReturning, paymentMethodVNPay, shippingMethodStandard, BigDecimal.valueOf(150)); // RETURNING order
//        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
//        when(orderStatusRepository.findByOrderStatusName("RETURNING")).thenReturn(Optional.of(orderStatusReturning));
//        when(orderStatusRepository.findById(8)).thenReturn(Optional.of(orderStatusInspection)); // INSPECTION status
//
//        assertDoesNotThrow(() -> orderService.inspectOrder(order.getOrderId()));
//        assertEquals("INSPECTION", order.getOrderStatus().getOrderStatusName());
//        verify(orderRepository, times(1)).save(any(Order.class));
//    }
//
//    @Test
//    void inspectOrder_NonReturningOrder_ShouldThrowException() {
//        Order order = orders.get(0); // PENDING order
//        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
//        when(orderStatusRepository.findByOrderStatusName("RETURNING")).thenReturn(Optional.of(orderStatusReturning));
//
//        assertThrows(IllegalStateException.class, () -> orderService.inspectOrder(order.getOrderId()));
//        verify(orderRepository, never()).save(any(Order.class));
//    }
//
////    @Test
////    void orderReturned_InspectionOrder_ShouldSetToReturnedAndReturnStock() {
////        Order order = createOrder("ORD003", user, orderStatusInspection, paymentMethodVNPay, shippingMethodStandard, BigDecimal.valueOf(150)); // INSPECTION order
////        Set<OrderVariationSingle> orderVariationSingles = new HashSet<>(Arrays.asList(OrderVariationSingle.builder()
////                .id(new OrderVariationSingleId(order.getOrderId(), variationSingle1.getId()))
////                .order(order)
////                .variationSingle(variationSingle1)
////                .variationPriceAtPurchase(variation1.getVariationPrice())
////                .build()));
////        order.setOrderVariationSingles(orderVariationSingles);
////
////        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
////        when(orderStatusRepository.findByOrderStatusName("INSPECTION")).thenReturn(Optional.of(orderStatusInspection));
////        when(orderStatusRepository.findById(6)).thenReturn(Optional.of(orderStatusReturned)); // RETURNED status
////        when(variationRepository.findByProduct_ProductCodeAndColor_ColorNameAndSize_SizeName(any(), any(), any())).thenReturn(Optional.of(variation1));
////        when(stockVariationRepository.findByVariationId(any())).thenReturn(Collections.singletonList(stockVariation1));
////
////
////        assertDoesNotThrow(() -> orderService.orderReturned(order.getOrderId()));
////        assertEquals("RETURNED", order.getOrderStatus().getOrderStatusName());
////        verify(orderRepository, times(1)).save(any(Order.class));
////        verify(stockVariationRepository, times(1)).save(any(StockVariation.class)); // Verify stock returned
////    }
//
//    @Test
//    void orderReturned_NonInspectionOrder_ShouldThrowException() {
//        Order order = orders.get(0); // PENDING order
//        when(orderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
//        when(orderStatusRepository.findByOrderStatusName("INSPECTION")).thenReturn(Optional.of(orderStatusInspection));
//
//        assertThrows(IllegalStateException.class, () -> orderService.orderReturned(order.getOrderId()));
//        verify(orderRepository, never()).save(any(Order.class));
//        verify(stockVariationRepository, never()).save(any(StockVariation.class)); // Verify stock not returned
//    }
//
////    @Test
////    void getOrdersByUserIdWithValidation_ExistingUserId_ShouldReturnOrderMapPage() {
////        String userId = user.getUserId();
////        Pageable pageable = Pageable.unpaged();
////        Page<Order> orderPage = new PageImpl<>(orders);
////
////        when(orderRepository.findByUserId(userId, pageable)).thenReturn(orderPage);
////        when(orderVariationSingleRepository.findById_OrderId(anyString())).thenReturn(Collections.emptyList());
////        when(variationSingleRepository.findByVariationSingleIds(anyList())).thenReturn(Collections.emptyList());
////        when(productRepository.findByProductCode(anyString())).thenReturn(Optional.of("ProductName"));
////
////
////        Map<String, Object> result = orderService.getOrdersByUserIdWithValidation(userId, pageable);
////
////        assertNotNull(result);
////        assertTrue(result.containsKey("orders"));
////        assertEquals(2, ((List<?>)result.get("orders")).size());
////        verify(orderRepository, times(1)).findByUserId(userId, pageable);
////    }
//
////    @Test
////    void getMyOrderById_ExistingOrderIdAndUsername_ShouldReturnOrderMap() {
////        String orderId = "ORD001";
////        String username = user.getUserUsername();
////        Order order = orders.get(0);
////        when(orderRepository.findOrderByUserIdAndOrderId(username, orderId)).thenReturn(Optional.of(order));
////        when(orderVariationSingleRepository.findById_OrderId(orderId)).thenReturn(Collections.emptyList());
////        when(variationSingleRepository.findByVariationSingleIds(anyList())).thenReturn(Collections.emptyList());
////
////        Optional<Map<String, Object>> result = orderService.getMyOrderById(orderId, username);
////
////        assertTrue(result.isPresent());
////        assertEquals(orderId, result.get().get("orderId"));
////        verify(orderRepository, times(1)).findOrderByUserIdAndOrderId(username, orderId);
////    }
//
//    @Test
//    void getMyOrderById_NonExistingOrderIdOrUsername_ShouldReturnEmptyOptional() {
//        String orderId = "ORD999";
//        String username = "nonExistingUser";
//        when(orderRepository.findOrderByUserIdAndOrderId(username, orderId)).thenReturn(Optional.empty());
//
//        Optional<Map<String, Object>> result = orderService.getMyOrderById(orderId, username);
//
//        assertFalse(result.isPresent());
//        verify(orderRepository, times(1)).findOrderByUserIdAndOrderId(username, orderId);
//    }
//
////    @Test
////    void getOrdersByUserId_NullUserId_ShouldReturnAllOrdersSorted() {
////        Pageable pageable = Pageable.unpaged();
////        Page<Order> orderPage = new PageImpl<>(orders);
////
////        when(orderRepository.findAll(any(Pageable.class))).thenReturn(orderPage);
////        when(orderVariationSingleRepository.findById_OrderId(anyString())).thenReturn(Collections.emptyList());
////        when(variationSingleRepository.findByVariationSingleIds(anyList())).thenReturn(Collections.emptyList());
////
////        Map<String, Object> result = orderService.getOrdersByUserId(null, pageable);
////
////        assertNotNull(result);
////        assertTrue(result.containsKey("orders"));
////        assertEquals(2, ((List<?>)result.get("orders")).size());
////        verify(orderRepository, times(1)).findAll(any(Pageable.class));
////    }
//}