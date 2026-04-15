package com.unleashed.dto;

import java.time.OffsetDateTime;

public class OrderStatusDTO {
    private String orderId;
    private String orderStatusName;
    private OffsetDateTime orderCreatedAt;

    public OrderStatusDTO() {
    }

    public OrderStatusDTO(String orderId, String orderStatusName, OffsetDateTime orderCreatedAt) {
        this.orderId = orderId;
        this.orderStatusName = orderStatusName;
        this.orderCreatedAt = orderCreatedAt;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderStatusName() {
        return orderStatusName;
    }

    public void setOrderStatusName(String orderStatusName) {
        this.orderStatusName = orderStatusName;
    }

    public OffsetDateTime getOrderCreatedAt() {
        return orderCreatedAt;
    }

    public void setOrderCreatedAt(OffsetDateTime orderCreatedAt) {
        this.orderCreatedAt = orderCreatedAt;
    }
}