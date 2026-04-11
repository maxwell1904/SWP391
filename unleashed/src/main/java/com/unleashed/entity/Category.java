package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonView;
import com.unleashed.util.Views;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "category", schema = "dbo")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id", nullable = false)
    @JsonView(Views.TransactionView.class)
    private Integer id;

    @Size(max = 255)
    @Nationalized
    @Column(name = "category_name")
    @JsonView(Views.TransactionView.class)
    private String categoryName;

    @Nationalized
    @Lob
    @Column(name = "category_description")
    private String categoryDescription;

    @Size(max = 255)
    @Nationalized
    @Column(name = "category_image_url")
    private String categoryImageUrl;

    @Column(name = "category_created_at")
    private OffsetDateTime categoryCreatedAt;

    @Column(name = "category_updated_at")
    private OffsetDateTime categoryUpdatedAt;

    @PrePersist
    public void prePersist() {
        setCategoryCreatedAt(OffsetDateTime.now());
        setCategoryUpdatedAt(OffsetDateTime.now());
    }

    @PreUpdate
    public void preUpdate() {
        setCategoryUpdatedAt(OffsetDateTime.now());
    }
}