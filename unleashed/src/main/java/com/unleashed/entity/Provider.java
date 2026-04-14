package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.unleashed.util.Views;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "provider", schema = "dbo")
public class Provider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "provider_id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @Nationalized
    @Column(name = "provider_name")
    @JsonView(Views.TransactionView.class)
    private String providerName;

    @Size(max = 255)
    @Nationalized
    @Column(name = "provider_image_url")
    private String providerImageUrl;

    @Size(max = 255)
    @Nationalized
    @Column(name = "provider_email")
    private String providerEmail;

    @Size(max = 12)
    @Nationalized
    @Column(name = "provider_phone", length = 12)
    private String providerPhone;

    @Size(max = 255)
    @Nationalized
    @Column(name = "provider_address")
    private String providerAddress;

    @Column(name = "provider_created_at")
    private OffsetDateTime providerCreatedAt;

    @Column(name = "provider_updated_at")
    private OffsetDateTime providerUpdatedAt;

    @OneToMany(mappedBy = "provider")
    @JsonIgnore
    private Set<Transaction> transactions = new LinkedHashSet<>();

    @PrePersist
    protected void onPrePersist() {
        setProviderCreatedAt(OffsetDateTime.now());
        setProviderUpdatedAt(OffsetDateTime.now());
    }

    @PreUpdate
    protected void onPreUpdate() {
        setProviderUpdatedAt(OffsetDateTime.now());
    }
}