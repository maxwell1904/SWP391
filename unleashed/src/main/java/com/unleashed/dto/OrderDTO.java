package com.unleashed.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.unleashed.entity.Voucher;
import com.unleashed.entity.OrderStatus;
import com.unleashed.entity.PaymentMethod;
import com.unleashed.entity.ShippingMethod;
import lombok.*;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Getter
@Setter
public class OrderDTO {
    private String orderId;
    private Date orderDate;
    private OrderStatus orderStatus;
    private String notes;
    private Voucher voucher;
    private String billingAddress;
    private Date expectedDeliveryDate;
    private ShippingMethod shippingMethod;
    private Double totalAmount;
    private PaymentMethod paymentMethod;
    private String trackingNumber;
    private String transactionReference;
    private String userAddress;
    private String userId; // Thêm thông tin userId
    private String customerUsername;
    private String staffId; // Thêm thông tin staffId
    private String staffUsername;
    private String voucherCode;


    @JsonProperty("orderDetails") // Đảm bảo tên này giống như trong JSON
    private List<OrderDetailDTO> orderDetails;
}
