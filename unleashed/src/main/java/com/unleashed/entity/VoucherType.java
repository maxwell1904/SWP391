package com.unleashed.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "voucher_type", schema = "dbo")
public class VoucherType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "voucher_type_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "voucher_type_name")
    private String voucherTypeName;

}