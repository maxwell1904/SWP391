package com.unleashed.rest;

import com.unleashed.dto.WishlistDTO;
import com.unleashed.entity.Wishlist;
import com.unleashed.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/wishlist")
public class WishlistRestController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping()
    public List<WishlistDTO> getWishlist(@RequestParam String username) {
        return wishlistService.getWishlistByUser(username);
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
