package com.unleashed.rest;

import com.unleashed.dto.OrderDTO;
import com.unleashed.dto.ResponseDTO;
import com.unleashed.entity.OrderStatus;
import com.unleashed.entity.User;
import com.unleashed.service.OrderService;
import com.unleashed.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderRestController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "priority_desc") String sort,
            @RequestParam(required = false) Integer statusId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Map<String, Object> ordersResponse = orderService.getOrders(search, sort, statusId, page, size);
        return ResponseEntity.ok(ordersResponse);
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping("/statuses")
    public ResponseEntity<List<OrderStatus>> getAllOrderStatuses() {
        List<OrderStatus> statuses = orderService.getAllOrderStatuses();
        return ResponseEntity.ok(statuses);
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOrderById(@PathVariable String id) {
        Optional<Map<String, Object>> order = orderService.getOrderById(id);
        return order.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }


    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/me/{id}")
    public ResponseEntity<Map<String, Object>> getMyOrderById(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        Optional<Map<String, Object>> order = orderService.getMyOrderById(id, currentUsername);
        return order.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

//    @GetMapping("/{orderId}/details")
//    public List<OrderDetailDTO> getOrderDetails(@PathVariable String orderId) {
//
//        return orderService.getOrderDetails(orderId);
//    }


    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getOrdersByUserId(
            @PathVariable String userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Map<String, Object> ordersResponse = orderService.getOrdersByUserId(userId, pageable);
        return ResponseEntity.ok(ordersResponse);
    }


    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/my-orders")
    public ResponseEntity<Map<String, Object>> getOrdersForCurrentUser(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        }

        User currentUser = userService.findByUsername(currentUsername);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        Pageable pageable = PageRequest.of(page, size);
        Map<String, Object> ordersResponse = orderService.getOrdersByUserIdWithValidation(currentUser.getUserId().toString(), pageable);

        return ResponseEntity.ok(ordersResponse);
    }


    @PreAuthorize("hasAuthority('CUSTOMER')")
    @PostMapping("/check-stock")
    public ResponseEntity<ResponseDTO> checkStockAvailability(@RequestBody OrderDTO orderDTO) {
        try {
            orderService.checkStockAvailability(orderDTO);
            return ResponseEntity.ok(new ResponseDTO(HttpStatus.OK.value(), "Stock is available."));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ResponseDTO(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
        }
    }


    @PreAuthorize("hasAuthority('CUSTOMER')")
    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody OrderDTO orderDTO, HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        String userId = userService.findByUsername(currentUsername).getUserId().toString();
        orderDTO.setUserId(userId);
        try {
            Map<String, Object> jsonResponse = orderService.createOrder(orderDTO, request);
            return ResponseEntity.ok(jsonResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }


    @PreAuthorize("hasAuthority('CUSTOMER')")
    @PostMapping("/{orderId}/payment-callback")
    public ResponseEntity<ResponseDTO> handlePaymentCallback(
            @PathVariable String orderId,
            @RequestParam("isSuccess") boolean isSuccess) {
        orderService.handlePaymentCallback(orderId, isSuccess);
        ResponseDTO responseDTO = new ResponseDTO(HttpStatus.OK.value(), "Payment callback processed successfully.");
        return ResponseEntity.ok(responseDTO);
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PutMapping("/{orderId}/staff-review")
    public ResponseEntity<ResponseDTO> reviewOrderByStaff(@PathVariable String orderId, @RequestBody Map<String, Object> body) {
        //System.out.println("REVIEW BY STAFF");
        try {
            boolean isApproved = (boolean) body.getOrDefault("isApproved", false);
            String staffName = (String) body.get("staffName");
            if (staffName == null || staffName.isEmpty()) {
                throw new IllegalArgumentException("Staff name is required.");
            }
            orderService.reviewOrderByStaff(orderId, staffName, isApproved);
            ResponseDTO responseDTO = new ResponseDTO(HttpStatus.OK.value(), "Order reviewed successfully.");
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            ResponseDTO responseDTO = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseDTO);
        }
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @PutMapping("/{orderId}/confirm-receipt")
    public ResponseEntity<ResponseDTO> confirmOrderReceived(@PathVariable String orderId) {
        try {
            orderService.confirmOrderReceived(orderId);
            ResponseDTO responseDTO = new ResponseDTO(HttpStatus.OK.value(), "Order confirmed as received.");
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            ResponseDTO responseDTO = new ResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseDTO);
        }
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN', 'CUSTOMER')")
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<ResponseDTO> cancelOrder(@PathVariable String orderId) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            orderService.cancelOrder(orderId);
            responseDTO.setStatusCode(HttpStatus.OK.value());
            responseDTO.setMessage("Order cancelled successfully.");
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            responseDTO.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            responseDTO.setMessage("Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseDTO);
        }
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN', 'CUSTOMER')")
    @PutMapping("/{orderId}/return")
    public ResponseEntity<ResponseDTO> returnOrder(@PathVariable String orderId) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            orderService.returnOrder(orderId);
            responseDTO.setStatusCode(HttpStatus.OK.value());
            responseDTO.setMessage("Order returned successfully.");
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            responseDTO.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            responseDTO.setMessage("Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseDTO);
        }
    }


    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PutMapping("/{orderId}/inspect")
    public ResponseEntity<ResponseDTO> inspectOrder(@PathVariable String orderId) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            orderService.inspectOrder(orderId);
            responseDTO.setStatusCode(HttpStatus.OK.value());
            responseDTO.setMessage("Order inspection checked successfully.");
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            responseDTO.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            responseDTO.setMessage("Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseDTO);
        }
    }


    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PutMapping("/{orderId}/returned")
    public ResponseEntity<ResponseDTO> orderReturned(@PathVariable String orderId) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            orderService.orderReturned(orderId);
            responseDTO.setStatusCode(HttpStatus.OK.value());
            responseDTO.setMessage("Order returned successfully.");
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            responseDTO.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            responseDTO.setMessage("Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseDTO);
        }
    }


}
