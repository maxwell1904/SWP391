package com.unleashed.repo;

import com.unleashed.entity.VariationSingle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VariationSingleRepository extends JpaRepository<VariationSingle, Integer> {

    @Query("SELECT vs FROM VariationSingle vs WHERE vs.id IN :variationSingleIds")
    List<VariationSingle> findByVariationSingleIds(@Param("variationSingleIds") List<Integer> variationSingleIds);

    Page<VariationSingle> findByVariationIsNull(Pageable pageable);

}
