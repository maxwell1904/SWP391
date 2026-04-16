package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.unleashed.util.Views;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.RandomStringUtils;
import org.hibernate.annotations.Nationalized;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "product", schema = "dbo")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_status_id")
    private ProductStatus productStatus;

    @Nationalized
    @Column(name = "product_name", length = 255)
    private String productName;

    @Nationalized
    @Column(name = "product_code")
    private String productCode;

    @Lob
    @Nationalized
    @Column(name = "product_description")
    private String productDescription;

    @Column(name = "product_created_at")
    private OffsetDateTime productCreatedAt;

    @Column(name = "product_updated_at")
    private OffsetDateTime productUpdatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @JsonView(Views.ProductView.class)
    private List<Variation> productVariations = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "product_category",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id"))
    private List<Category> categories = new ArrayList<>();

    @PrePersist
    protected void onPrePersist() {
        setProductCreatedAt(OffsetDateTime.now());
        setProductUpdatedAt(OffsetDateTime.now());

        if (this.productCode == null && this.productName != null) {
            String codePrefix = generateProductCodePrefix(this.productName);
            String randomNumbers = RandomStringUtils.randomNumeric(3);
            this.productCode = codePrefix + randomNumbers;
        }
    }

    @PreUpdate
    protected void onPreUpdate() {
        setProductUpdatedAt(OffsetDateTime.now());
    }

    private String generateProductCodePrefix(String productName) {
        StringBuilder prefix = new StringBuilder();
        int charCount = 0;
        for (char c : productName.toCharArray()) {
            if (charCount < 3) {
                if (c != ' ') {
                    prefix.append(Character.toUpperCase(c));
                    charCount++;
                }
            } else {
                break;
            }
        }
        return prefix.toString();
    }
}