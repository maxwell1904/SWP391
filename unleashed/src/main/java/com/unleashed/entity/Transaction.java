package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonView;
import com.unleashed.util.Views;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "\"transaction\"", schema = "dbo")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id", nullable = false)
    @JsonView(Views.TransactionView.class)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "stock_id")
    @JsonView(Views.TransactionView.class)
    private Stock stock;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variation_id")
    @JsonView(Views.TransactionView.class)
    private Variation variation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "provider_id")
    @JsonView(Views.TransactionView.class)
    private Provider provider;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "incharge_employee_id")
    @JsonView(Views.TransactionView.class)
    private User inchargeEmployee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "transaction_type_id")
    @JsonView(Views.TransactionView.class)
    private TransactionType transactionType;

    @Column(name = "transaction_quantity")
    @JsonView(Views.TransactionView.class)
    private Integer transactionQuantity;

    @Column(name = "transaction_date")
    @JsonView(Views.TransactionView.class)
    private OffsetDateTime transactionDate;

    @Column(name = "transaction_product_price", precision = 22, scale = 2)
    @JsonView(Views.TransactionView.class)
    private BigDecimal transactionProductPrice;

    @Column(name = "transaction_note", length = 500)
    @JsonView(Views.TransactionView.class)
    private String transactionNote;

    @PrePersist
    public void prePersist() {
        setTransactionDate(OffsetDateTime.now());
        if (getVariation() != null) {
            setTransactionProductPrice(getVariation().getVariationPrice());
        }
    }
}
