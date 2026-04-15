package com.unleashed.rest;

import com.unleashed.dto.*;
import com.unleashed.entity.Comment;
import com.unleashed.entity.Review;
import com.unleashed.entity.User;
import com.unleashed.service.ReviewService;
import com.unleashed.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewRestController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        List<Review> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }

//    @GetMapping("/products/{productId}")
//    public ResponseEntity<List<Object []>> getReviewsByProductId(@PathVariable String productId) {
//        List<Object []> reviews = reviewService.getReviewsByProductId(productId);
//        return ResponseEntity.ok(reviews);
//    }

    /**
     * Fetches top-level reviews for a product with pagination.
     * The user's own review will be prioritized at the top of the first page.
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ProductReviewDTO>> getAllReviewsByProductId(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User currentUser = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // Check if user is authenticated and not an anonymous user
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
            currentUser = userService.findByUsername(currentUsername);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductReviewDTO> reviewPage = reviewService.getAllReviewsByProductId(productId, pageable, currentUser);

        return ResponseEntity.ok(reviewPage);
    }

    /**
     * Fetches the direct child comments (replies) for a given parent comment.
     */
    @GetMapping("/comments/{commentId}/replies")
    public ResponseEntity<Page<ProductReviewDTO>> getCommentReplies(
            @PathVariable Integer commentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductReviewDTO> repliesPage = reviewService.getRepliesForComment(commentId, pageable);
        return ResponseEntity.ok(repliesPage);
    }

    @GetMapping("/order-details")
    public ResponseEntity<List<Review>> getReviewsByOrderDetailId(@RequestParam Integer orderDetailId) {
        List<Review> reviews = reviewService.getReviewsByOrderDetailId(orderDetailId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user/{userName}")
    public ResponseEntity<Page<UserReviewHistoryDTO>> getReviewsByUserName(
                                                                            @PathVariable String userName,
                                                                            @RequestParam(defaultValue = "0") int page,
                                                                            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserReviewHistoryDTO> reviews = reviewService.getReviewsByUserName(userName, pageable);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CUSTOMER')") // Ensure only customers can post reviews
    public ResponseEntity<?> addReview(@Valid @RequestBody ReviewDTO review) {
        try {
            // Get the currently authenticated user from the security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
            User currentUser = userService.findByUsername(currentUsername);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not found or not authenticated."));
            }

            // Call the service with the DTO and the authenticated User object
            Review createdReview = reviewService.addReview(review, currentUser);
            return ResponseEntity.ok(createdReview);

        } catch (ResponseStatusException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", e.getStatusCode().value());
            errorResponse.put("message", e.getReason());
            return ResponseEntity.status(e.getStatusCode()).body(errorResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", 500,
                    "message", "Error occurred while processing the request."
            ));
        }
    }


    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Integer commentId,
            @RequestParam String username, // Lấy username từ request param hoặc token (tùy theo cách xác thực)
            @Valid @RequestBody CommentUpdateRequestDTO updateRequestDTO) {
        try {
            Comment updatedComment = reviewService.updateComment(commentId, username, updateRequestDTO);
            return ResponseEntity.ok(updatedComment);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of(
                    "status", e.getStatusCode().value(),
                    "error", e.getStatusCode().toString(),
                    "message", e.getReason()  // Lấy message từ exception
            ));
        }
    }


    // **ExceptionHandler cho MethodArgumentNotValidException**
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return errors;
    }

    @GetMapping("/check-exists")
    public ResponseEntity<Boolean> checkReviewExists(
            @RequestParam String productId,
            @RequestParam String orderId,
            @RequestParam String userId) {
        boolean exists = reviewService.checkReviewExists(productId, orderId, userId);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/get-all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<Page<DashboardReviewDTO>> getDashboardReviews(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "date_desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (size > 50) {
            size = 50;
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<DashboardReviewDTO> dashboardReviewsPage = reviewService.getAllDashboardReviews(pageable, search, sort);
        return ResponseEntity.ok(dashboardReviewsPage);
    }

    /**
     * It now accepts pagination parameters and returns a Page object.
     */
    @GetMapping("/dashboard/product/{productId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<Page<ProductReviewDTO>> getAllReviewsByProductIdDashboard(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductReviewDTO> reviewPage = reviewService.getAllReviewsByProductId(productId, pageable, null);
        return ResponseEntity.ok(reviewPage);
    }


    /**
     * Checks if the current authenticated user is eligible to write a review for a given product.
     *
     * @param productId The ID of the product to check.
     * @return A list of eligible orders (as DTOs) or an empty list.
     */
    @GetMapping("/eligibility")
    @PreAuthorize("hasAuthority('CUSTOMER')")
    public ResponseEntity<List<ReviewEligibilityDTO>> checkEligibility(@RequestParam String productId) {
        // Get the currently authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        User currentUser = userService.findByUsername(currentUsername);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<ReviewEligibilityDTO> eligibility = reviewService.getReviewEligibility(productId, currentUser);
        return ResponseEntity.ok(eligibility);
    }





}