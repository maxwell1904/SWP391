package com.unleashed.rest;

import com.unleashed.service.CartService;
import com.unleashed.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/cart")
public class CartRestController {
    private final CartService cartService;
    private final UserService userService;

    @Autowired
    public CartRestController(CartService cartService, UserService userService) {
        this.cartService = cartService;
        this.userService = userService;
    }

    private String getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            String currentUsername = userDetails.getUsername();
            return userService.findByUsername(currentUsername).getUserId().toString();
        } else {
            return null;
        }
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping
    public ResponseEntity<?> getUserCart() {
        try {
            return ResponseEntity.ok(cartService.getCartByUserId(getUserId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error fetching user cart");
        }
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @PostMapping("/{variationId}")
    public ResponseEntity<?> addToCart(@PathVariable("variationId") Integer variationId,
                                       @RequestBody String quantity) {
        try {
            cartService.addToCart(getUserId(),
                    variationId,
                    Integer.parseInt(quantity.substring(0, quantity.length() - 1)));
            return ResponseEntity.ok("Successfully added item into the cart");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @DeleteMapping("/{variationId}")
    public ResponseEntity<?> removeFromCart(@PathVariable("variationId") Integer variationId) {
        try {
            cartService.removeFromCart(getUserId(), variationId);
            return ResponseEntity.ok("Success remove item from cart.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error removing item from cart.");
        }
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @DeleteMapping("/All")
    public ResponseEntity<?> removeAllFromCart() {
        try {
            cartService.removeAllFromCart(getUserId());
            return ResponseEntity.ok("Success remove all item from cart.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error removing item from cart.");
        }
    }
}