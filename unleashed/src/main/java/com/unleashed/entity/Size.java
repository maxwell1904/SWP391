package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonView;
import com.unleashed.util.Views;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@Entity
@Table(name = "\"size\"", schema = "dbo")
public class Size {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "size_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "size_name")
    @JsonView({Views.ProductView.class, Views.TransactionView.class})
    private String sizeName;

    // @OneToMany(mappedBy = "size")
    // private Set<Variation> variations = new LinkedHashSet<>();
}