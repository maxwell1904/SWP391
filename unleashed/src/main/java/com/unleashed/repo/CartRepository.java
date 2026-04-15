package com.unleashed.repo;

import com.unleashed.entity.Cart;
import com.unleashed.entity.composite.CartId;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface CartRepository extends CrudRepository<Cart, CartId> {

    List<Cart> findAllById_UserId(UUID idUserId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.id.userId = :userId")
    void deleteAllById_UserId(UUID userId);
}