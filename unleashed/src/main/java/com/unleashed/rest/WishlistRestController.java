package com.unleashed.rest;

import com.unleashed.dto.WishlistDTO;
import com.unleashed.entity.Wishlist;
import com.unleashed.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/wishlist")
public class WishlistRestController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping()
    public Map<String, Object> getWishlist(
            @RequestParam String username,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "6") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return wishlistService.getWishlistByUser(username, pageable);
    }

    @PostMapping("/add")
    public Wishlist addToWishlist(@RequestParam String username, @RequestParam String productId) {

        return wishlistService.addToWishlist(username, productId);
    }

    @DeleteMapping("/remove")
    public void removeFromWishlist(@RequestParam String username, @RequestParam String productId) {
        wishlistService.removeFromWishlist(username, productId);
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkWishlist(
            @RequestParam String username,
            @RequestParam String productId) {
        boolean isInWishlist = wishlistService.isProductInWishlist(username, productId);
        return ResponseEntity.ok(isInWishlist);
    }
}
