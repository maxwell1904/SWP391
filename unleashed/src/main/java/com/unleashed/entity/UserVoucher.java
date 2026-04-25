package com.unleashed.entity;

import com.unleashed.entity.composite.UserVoucherId;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_voucher", schema = "dbo")
public class UserVoucher {
    @EmbeddedId
    private UserVoucherId id;

    @MapsId("voucherId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "voucher_id", nullable = false)
    private Voucher voucher;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "is_voucher_used", nullable = false)
    private Boolean isVoucherUsed = false;

    @Column(name = "voucher_used_at")
    private OffsetDateTime voucherUsedAt;

}