package com.unleashed.service;

import com.unleashed.dto.WishlistDTO;
import com.unleashed.entity.composite.WishlistId;
import com.unleashed.entity.User;
import com.unleashed.entity.Wishlist;
import com.unleashed.repo.ProductRepository;
import com.unleashed.repo.UserRepository;
import com.unleashed.repo.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getWishlistByUser(String username, Pageable pageable) {
        // 1. Tìm User entity dựa trên username
        User user = userRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getRole().getId().equals(2)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        Page<WishlistDTO> wishlistPage = wishlistRepository.findWishlistByUserId(user.getUserId(), pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("wishlist", wishlistPage.getContent());
        response.put("currentPage", wishlistPage.getNumber());
        response.put("totalPages", wishlistPage.getTotalPages());
        response.put("totalItems", wishlistPage.getTotalElements());
        return response;
    }

    public Wishlist addToWishlist(String username, String productId) {
        // 1. Tìm User entity dựa trên username
        User user = userRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getRole().getId().equals(2)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        if (!productRepository.existsById(UUID.fromString(productId))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        if (isProductInWishlist(username, productId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product already exists in Wishlist");
        }

        UUID userId = user.getUserId(); // Lấy userId từ User entity

        // 2. Tạo WishlistId và Wishlist entity như cũ, nhưng sử dụng userId vừa lấy
        WishlistId wishlistId = new WishlistId();
        wishlistId.setUserId(userId); // Sử dụng userId đã lấy được
        wishlistId.setProductId(UUID.fromString(productId));

        Wishlist wishlist = new Wishlist();
        wishlist.setId(wishlistId);

        return wishlistRepository.save(wishlist);
    }

    public void removeFromWishlist(String username, String productId) {
        // 1. Tìm User entity dựa trên username
        User user = userRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getRole().getId().equals(2)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        if (!productRepository.existsById(UUID.fromString(productId))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        if (!isProductInWishlist(username, productId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found in Wishlist");
        }

        UUID userId = user.getUserId();

        WishlistId wishlistId = new WishlistId();
        wishlistId.setUserId(userId);
        wishlistId.setProductId(UUID.fromString(productId));

        wishlistRepository.deleteById(wishlistId);
    }

    public boolean isProductInWishlist(String username, String productId) {
        User user = userRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        WishlistId wishlistId = new WishlistId();
        wishlistId.setUserId(user.getUserId());
        wishlistId.setProductId(UUID.fromString(productId));
        return wishlistRepository.existsById(wishlistId);
    }
}
