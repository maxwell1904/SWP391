package com.unleashed.repo;

import com.unleashed.entity.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SizeRepository extends JpaRepository<Size, Integer> {
    @Query("SELECT s FROM Size s join Variation v on s.id = v.size.id WHERE v.product.productId = :productId")
    List<Size> findAllByProductId(@Param("productId") UUID productId);
}