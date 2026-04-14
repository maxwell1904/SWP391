package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "brand", schema = "dbo")
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "brand_id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @Nationalized
    @Column(name = "brand_name")
    private String brandName;

    @Nationalized
    @Column(name = "brand_description")
    private String brandDescription;

    @Size(max = 255)
    @Nationalized
    @Column(name = "brand_image_url")
    private String brandImageUrl;

    @Size(max = 255)
    @Nationalized
    @Column(name = "brand_website_url")
    private String brandWebsiteUrl;

    @Column(name = "brand_created_at")
    private OffsetDateTime brandCreatedAt;

    @Column(name = "brand_updated_at")
    private OffsetDateTime brandUpdatedAt;

//    @OneToMany(mappedBy = "brand")
//    @JsonIgnore
//    private Set<Product> products = new LinkedHashSet<>();

    @PrePersist
    public void prePersist() {
        setBrandCreatedAt(OffsetDateTime.now());
        setBrandUpdatedAt(OffsetDateTime.now());
    }

    @PreUpdate
    public void preUpdate() {
        setBrandUpdatedAt(OffsetDateTime.now());
    }
}