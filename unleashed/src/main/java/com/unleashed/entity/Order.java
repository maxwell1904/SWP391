package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "\"order\"", schema = "dbo")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Size(max = 255)
    @Nationalized
    @Column(name = "order_id", nullable = false)
    private String orderId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_status_id")
    private OrderStatus orderStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id")
    private PaymentMethod paymentMethod;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shipping_method_id")
    private ShippingMethod shippingMethod;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "discount_id")
    private Discount discount;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "incharge_employee_id")
    private User inchargeEmployee;

    @Column(name = "order_date")
    private OffsetDateTime orderDate;

    @Column(name = "order_total_amount", precision = 22, scale = 2)
    private BigDecimal orderTotalAmount;

    @Size(max = 50)
    @Nationalized
    @Column(name = "order_tracking_number", length = 50)
    private String orderTrackingNumber;

    @Nationalized
    @Lob
    @Column(name = "order_note")
    private String orderNote;

    @Size(max = 255)
    @Nationalized
    @Column(name = "order_billing_address")
    private String orderBillingAddress;

    @Column(name = "order_expected_delivery_date")
    private Date orderExpectedDeliveryDate;

    @Size(max = 255)
    @Nationalized
    @Column(name = "order_transaction_reference")
    private String orderTransactionReference;

    @Column(name = "order_tax", precision = 3, scale = 2)
    private BigDecimal orderTax;

    @Column(name = "order_created_at")
    private OffsetDateTime orderCreatedAt;

    @Column(name = "order_updated_at")
    private OffsetDateTime orderUpdatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "order")
    @Builder.Default
    private Set<OrderVariationSingle> orderVariationSingles = new LinkedHashSet<>();


    @PrePersist
    protected void onCreate() {
        setOrderCreatedAt(OffsetDateTime.now());
        setOrderUpdatedAt(OffsetDateTime.now());
    }

    @PreUpdate
    protected void onUpdate() {
        setOrderUpdatedAt(OffsetDateTime.now());
    }
}