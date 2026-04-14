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
@Table(name = "stock", schema = "dbo")
@JsonView(Views.ListView.class)
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "stock_name")
    private String stockName;

    @Nationalized
    @Column(name = "stock_address")
    private String stockAddress;
}