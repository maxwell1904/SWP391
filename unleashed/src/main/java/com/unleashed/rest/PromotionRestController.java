package com.unleashed.rest;

import com.unleashed.dto.ProductPromotionDTO;
import com.unleashed.entity.Product;
import com.unleashed.entity.Promotion;
import com.unleashed.repo.PromotionRepository;
import com.unleashed.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
public class PromotionRestController {

    private final PromotionService promotionService;

    @Autowired
    public PromotionRestController(PromotionService promotionService, PromotionRepository promotionRepository) {
        this.promotionService = promotionService;
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllPromotions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
            Page<Promotion> promotionsPage = promotionService.getPromotions(search, status, pageable);
            return ResponseEntity.ok(promotionsPage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping("/{promotionId}")
    public ResponseEntity<?> getPromotionById(@PathVariable Integer promotionId) {
        try {
            return promotionService.findPromotionById(promotionId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createPromotion(@RequestBody Promotion promotion) {
        try {
            return ResponseEntity.ok(promotionService.createPromotion(promotion));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @PutMapping("/{promotionId}")
    public ResponseEntity<?> updatePromotion(@PathVariable Integer promotionId, @RequestBody Promotion promotion) {
        try {
            return promotionService.updatePromotion(promotionId, promotion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{promotionId}")
    public ResponseEntity<?> deletePromotion(@PathVariable Integer promotionId) {
        try {
            return promotionService.deletePromotion(promotionId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @GetMapping("/{promotionId}/products")
    public ResponseEntity<Page<ProductPromotionDTO>> getProductsInPromotion(
                                                                   @PathVariable int promotionId,
                                                                   @RequestParam(required = false) String search,
                                                                   @RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("productName").ascending());
            Page<ProductPromotionDTO> products = promotionService.getProductsInPromotion(promotionId, search, pageable);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @GetMapping("/{promotionId}/products/available")
    public ResponseEntity<Page<ProductPromotionDTO>> getProductsNotInPromotion(
                                                                      @PathVariable int promotionId,
                                                                      @RequestParam(required = false) String search,
                                                                      @RequestParam(defaultValue = "0") int page,
                                                                      @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("productName").ascending());
            Page<ProductPromotionDTO> products = promotionService.getProductsNotInPromotion(promotionId, search, pageable);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @PostMapping("/{promotionId}/products")
    public ResponseEntity<?> addProductsToPromotion(@PathVariable int promotionId, @RequestBody Map<String, List<String>> requestBody) {
        List<String> productIds = requestBody.get("productIds");

        // Kiểm tra danh sách productIds không rỗng
        if (productIds == null || productIds.isEmpty()) {
            return ResponseEntity.badRequest().body("Product IDs must not be null or empty");
        }
        try {
            return promotionService.addProductsToPromotion(promotionId, productIds);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    @DeleteMapping("/{promotionId}/products")
    public ResponseEntity<?> removeProductFromPromotion(@PathVariable int promotionId, @RequestParam String productId) {
        try {
            return promotionService.removeProductFromPromotion(promotionId, productId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

//    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
//    @GetMapping("/{promotionId}/products")
//    public ResponseEntity<?> getProductsInPromotion(@PathVariable int promotionId) {
//        try {
//            return promotionService.getProductsInPromotion(promotionId);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    @GetMapping("/products")
    public ResponseEntity<?> getListProductInPromotions() {
        try {
            return promotionService.getListProductsInPromotions();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
