package com.unleashed.rest;

import com.unleashed.dto.ProductDTO;
import com.unleashed.service.ProductRecommendationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class ProductRecommendationRestController {

    private static final Logger log = LoggerFactory.getLogger(ProductRecommendationRestController.class);
    private final ProductRecommendationService recommendationService;


    @Autowired
    public ProductRecommendationRestController(ProductRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }


    @GetMapping
    public ResponseEntity<?> getRecommendations(
            @RequestParam(value = "username", required = false) String username,
            @RequestParam("productId") String currentProductId) {
        try {
            List<ProductDTO> recommendations = recommendationService.getRecommendedProducts(username, currentProductId);
            if (recommendations == null || recommendations.isEmpty()) {
                return ResponseEntity.noContent().build(); // 204 No Content if no recommendations
            }
            return ResponseEntity.ok(recommendations); // 200 OK with the recommendations

        } catch (ResourceNotFoundException e) {
            log.warn("Resource not found while getting recommendations: {}", e.getMessage());
            // Return 404 Not Found
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resource not found: " + e.getMessage());
        } catch (Exception e) {
            log.error("An unexpected error occurred while getting recommendations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An internal server error occurred.");
        }
    }
}