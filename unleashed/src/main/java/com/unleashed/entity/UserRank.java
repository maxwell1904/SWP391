package com.unleashed.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "user_rank", schema = "dbo")
public class UserRank {
    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @MapsId
    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "rank_id", nullable = false)
    private Rank rank;

    @Column(name = "money_spent", precision = 22, scale = 2)
    private BigDecimal moneySpent;

    @NotNull
    @Column(name = "rank_status", nullable = false)
    private Short rankStatus;

    @NotNull
    @Column(name = "rank_expire_date", nullable = false)
    private LocalDate rankExpireDate;

    @NotNull
    @Column(name = "rank_created_date", nullable = false)
    private OffsetDateTime rankCreatedDate;

    @NotNull
    @Column(name = "rank_updated_date", nullable = false)
    private OffsetDateTime rankUpdatedDate;

    @PrePersist
    protected void onCreate() {
        setRankCreatedDate(OffsetDateTime.now(ZoneId.systemDefault()));
        setRankUpdatedDate(OffsetDateTime.now(ZoneId.systemDefault()));
        setRankExpireDate(LocalDate.now(ZoneId.systemDefault()));
    }
}