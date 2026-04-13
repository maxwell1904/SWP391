package com.unleashed.repo;

import com.unleashed.entity.Color;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ColorRepository extends JpaRepository<Color, Integer> {
    @Query("SELECT c FROM Color c left join Variation v on c.id = v.color.id WHERE v.product.productId = :productId")
    List<Color> findAllByProductId(@Param("productId") UUID productId);
}