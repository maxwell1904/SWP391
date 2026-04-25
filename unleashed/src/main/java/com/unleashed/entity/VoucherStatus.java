package com.unleashed.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "voucher_status", schema = "dbo")
public class VoucherStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "voucher_status_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "voucher_status_name")
    private String voucherStatusName;

}