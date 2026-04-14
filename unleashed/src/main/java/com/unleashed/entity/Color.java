package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonView;
import com.unleashed.util.Views;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "color", schema = "dbo")
public class Color {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "color_id", nullable = false)
    @JsonView(Views.ProductView.class)
    private Integer id;

    @Nationalized
    @Column(name = "color_name")
    @JsonView({Views.TransactionView.class, Views.ProductView.class})
    private String colorName;

    @Nationalized
    @Column(name = "color_hex_code")
    @JsonView({Views.TransactionView.class, Views.ProductView.class})
    private String colorHexCode;

    // @OneToMany(mappedBy = "color")
    // private Set<Variation> variations = new LinkedHashSet<>();
}