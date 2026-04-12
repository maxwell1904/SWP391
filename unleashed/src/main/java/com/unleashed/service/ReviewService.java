package com.unleashed.service;

import com.unleashed.dto.*;
import com.unleashed.entity.*;
import com.unleashed.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderVariationSingleRepository orderVariationSingleRepository;
    private final VariationSingleRepository variationSingleRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository, OrderVariationSingleRepository orderVariationSingleRepository, VariationSingleRepository variationSingleRepository, CommentRepository commentRepository, UserRepository userRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.orderVariationSingleRepository = orderVariationSingleRepository;
        this.variationSingleRepository = variationSingleRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public List<Object[]> getReviewsByProductId(String productId) {
        return reviewRepository.findReviewByProductId(UUID.fromString(productId));
    }

    // Helper method to convert a Review/Comment to a DTO
    private ProductReviewDTO convertToProductReviewDTO(Review review) {
        ProductReviewDTO dto = new ProductReviewDTO();
        dto.setReviewId(review.getId());
        dto.setFullName(review.getUser().getUsername());
        dto.setReviewRating(review.getReviewRating());
        dto.setUserImage(review.getUser().getUserImage());

        // Find the root comment for this review
        Comment rootComment = commentRepository.findRootCommentByReviewId(review.getId()).orElse(null);
        if (rootComment != null) {
            dto.setReviewComment(rootComment.getCommentContent());
            dto.setCreatedAt(rootComment.getCommentCreatedAt());
            dto.setUpdatedAt(rootComment.getCommentUpdatedAt());
            dto.setCommentId(rootComment.getId());
        }
        return dto;
    }

    // Helper method to convert a Comment to a DTO
    private ProductReviewDTO convertToProductReviewDTO(Comment comment) {
        ProductReviewDTO dto = new ProductReviewDTO();
        dto.setCommentId(comment.getId());
        dto.setReviewComment(comment.getCommentContent());
        dto.setCreatedAt(comment.getCommentCreatedAt());
        dto.setUpdatedAt(comment.getCommentUpdatedAt());
        dto.setFullName(comment.getReview().getUser().getUsername());
        dto.setUserImage(comment.getReview().getUser().getUserImage());
        return dto;
    }


    /**
     * Fetches paginated top-level reviews and implements "My Review First" logic.
     */
    public Page<ProductReviewDTO> getAllReviewsByProductId(String productId, Pageable pageable, User currentUser) {
        Page<Review> reviewPage = reviewRepository.findTopLevelReviewsByProductId(UUID.fromString(productId), pageable);
        List<ProductReviewDTO> dtos = reviewPage.getContent().stream()
                .map(this::convertToProductReviewDTO)
                .collect(Collectors.toList());

        // "My Review First" logic
        if (currentUser != null && pageable.getPageNumber() == 0 && !dtos.isEmpty()) {
            ProductReviewDTO myReview = null;
            int myReviewIndex = -1;

            for (int i = 0; i < dtos.size(); i++) {
                if (dtos.get(i).getFullName().equals(currentUser.getUsername())) {
                    myReview = dtos.get(i);
                    myReviewIndex = i;
                    break;
                }
            }

            if (myReview != null && myReviewIndex > 0) {
                dtos.remove(myReviewIndex);
                dtos.add(0, myReview);
            }
        }

        return new PageImpl<>(dtos, pageable, reviewPage.getTotalElements());
    }

    /**
     * --- NEW METHOD for fetching replies ---
     * Fetches paginated replies for a parent comment.
     */
    public Page<ProductReviewDTO> getRepliesForComment(Integer commentId, Pageable pageable) {
        Page<Comment> commentPage = reviewRepository.findChildCommentsPaginated(commentId, pageable);
        List<ProductReviewDTO> dtos = commentPage.getContent().stream()
                .map(this::convertToProductReviewDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, commentPage.getTotalElements());
    }

    private List<ProductReviewDTO> getChildComments(Integer parentId, int level) {
        if (level == 0) return new ArrayList<>(); // Dừng đệ quy nếu quá 5 cấp

        List<ProductReviewDTO> childCommentDTOs = new ArrayList<>();
        List<Comment> childComments = reviewRepository.findChildComments(parentId);

        for (Comment childComment : childComments) {
            ProductReviewDTO childDto = new ProductReviewDTO();
            childDto.setCommentId(childComment.getId());
            childDto.setReviewComment(childComment.getCommentContent());
            childDto.setCreatedAt(childComment.getCommentCreatedAt());
            childDto.setUpdatedAt(childComment.getCommentUpdatedAt());

            // Lấy userImage và userUsername từ review của comment
            childDto.setUserImage(childComment.getReview().getUser().getUserImage());
            childDto.setFullName(childComment.getReview().getUser().getUsername());

            // Gọi đệ quy để lấy các comment con tiếp theo
            childDto.setChildComments(getChildComments(childComment.getId(), level - 1));

            childCommentDTOs.add(childDto);
        }
        return childCommentDTOs;
    }

    public List<Review> getReviewsByOrderDetailId(Integer variationSingleId) {
        return reviewRepository.findReviewsByOrderDetailId(variationSingleId);
    }

    @Transactional
    public Review addReview(ReviewDTO review, User user) { // Signature changed to accept User object
        // Check if a review already exists for this specific order
        boolean reviewExists = reviewRepository.existsByProduct_ProductIdAndOrder_OrderIdAndUser_UserId(
                UUID.fromString(review.getProductId()),
                review.getOrderId(),
                user.getUserId() // Use the User object directly
        );
        if (reviewExists) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already reviewed this product for this specific order.");
        }

        Product product = productRepository.findById(UUID.fromString(review.getProductId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found."));

        Order order = orderRepository.findById(review.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        // Security check: ensure the order belongs to the user submitting the review
        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only review products from your own orders.");
        }

        if (!"COMPLETED".equalsIgnoreCase(order.getOrderStatus().getOrderStatusName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only review products from completed orders.");
        }

        if (review.getReviewRating() < 1 || review.getReviewRating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review rating must be between 1 and 5.");
        }

        Review newReview = new Review();
        newReview.setReviewRating(review.getReviewRating());
        newReview.setProduct(product);
        newReview.setOrder(order);
        newReview.setUser(user); // Set the user from the authenticated context

        try {
            Review savedReview = reviewRepository.save(newReview);
            if (review.getReviewComment() != null && !review.getReviewComment().trim().isEmpty()) {
                Comment newComment = new Comment();
                newComment.setReview(savedReview);
                newComment.setCommentContent(review.getReviewComment());
                commentRepository.save(newComment);
            }
            return savedReview;
        } catch (Exception e) {
            System.err.println("Error saving review and comment: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error saving review and comment.");
        }
    }


    @Transactional
    public Comment updateComment(Integer commentId, String username, CommentUpdateRequestDTO updateRequestDTO) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found..."));

        if (!userRepository.existsByUserUsername(username)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        if (!comment.getReview().getUser().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update this comment.");
        }

        // Kiểm tra xem comment đã được chỉnh sửa chưa. Nếu commentUpdatedAt khác commentCreatedAt, nghĩa là đã chỉnh sửa.
        if (!comment.getCommentCreatedAt().equals(comment.getCommentUpdatedAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This comment has already been updated once and cannot be updated again.");
        }

        comment.setCommentContent(updateRequestDTO.getCommentContent());
        return commentRepository.save(comment);
    }


    public Page<UserReviewHistoryDTO> getReviewsByUserName(String userName, Pageable pageable) {
        Page<Review> reviewsPage = reviewRepository.findAllByUser_Username(userName, pageable);

        List<UserReviewHistoryDTO> dtoList = reviewsPage.getContent().stream()
                .map(this::mapReviewToUserReviewHistoryDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtoList, pageable, reviewsPage.getTotalElements());
    }

    private UserReviewHistoryDTO mapReviewToUserReviewHistoryDTO(Review review) {
        UserReviewHistoryDTO dto = new UserReviewHistoryDTO();
        dto.setId(review.getId());
        dto.setReviewRating(review.getReviewRating());

        if (review.getProduct() != null) {
            dto.setProductId(review.getProduct().getProductId().toString());
            dto.setProductName(review.getProduct().getProductName());
            String imageUrl = review.getProduct().getProductVariations().stream()
                    .map(Variation::getVariationImage)
                    .filter(img -> img != null && !img.isEmpty())
                    .findFirst()
                    .orElse(null);
            dto.setProductImageUrl(imageUrl);
        }

        // Correctly find the root comment associated with the review
        commentRepository.findRootCommentByReviewId(review.getId()).ifPresent(comment -> {
            dto.setCommentContent(comment.getCommentContent());
            dto.setCommentCreatedAt(comment.getCommentCreatedAt());
        });

        return dto;
    }

    public boolean checkReviewExists(String productId, String orderId, String userId) {
        return reviewRepository.existsByProduct_ProductIdAndOrder_OrderIdAndUser_UserId(UUID.fromString(productId), orderId, UUID.fromString(userId));
    }

    public Page<DashboardReviewDTO> getAllDashboardReviews(Pageable pageable, String search, String sort) {

        // Create a Sort object based on the sort parameter
        Sort sorting = Sort.by("commentCreatedAt").descending();
        if ("date_asc".equals(sort)) {
            sorting = Sort.by("commentCreatedAt").ascending();
        }

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sorting);

        Page<DashboardReviewDTO> pageResult = reviewRepository.findAllDashboardReviews(sortedPageable, search);

        List<DashboardReviewDTO> processedContent = pageResult.getContent().stream()
                .map(reviewDTO -> {
                    if (reviewDTO.getVariationImage() != null && !reviewDTO.getVariationImage().isEmpty()) {
                        reviewDTO.setVariationImage(reviewDTO.getVariationImage());
                    }
                    boolean isMaxReply = findCommentLevel(reviewDTO.getCommentId(), 1);
                    reviewDTO.setMaxReply(isMaxReply);
                    return reviewDTO;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(processedContent, sortedPageable, pageResult.getTotalElements());
    }

    public boolean findCommentLevel(Integer commentId, int level) {
        if (level >= 6) {
            return true; // Đạt level tối đa
        }
        Integer parentCommentId = reviewRepository.findParentComments(commentId);
        if (parentCommentId != null) {
            return findCommentLevel(parentCommentId, level + 1); // Đệ quy lên level tiếp theo
        } else {
            return false; // Không có comment cha, hoặc đã đến gốc và chưa đạt level 5
        }
    }

    /**
     * Checks which orders a user is eligible to leave a review for, for a specific product.
     *
     * @param productId The product being reviewed.
     * @param user      The currently authenticated user.
     * @return A list of DTOs containing eligible order IDs and their dates.
     */
    public List<ReviewEligibilityDTO> getReviewEligibility(String productId, User user) {
        // 1. Find all completed orders for this user and product
        List<Order> eligibleOrders = orderRepository.findCompletedOrdersByUserAndProduct(user.getUserId(), UUID.fromString(productId));

        // 2. Filter out orders that already have a review from this user for this product
        return eligibleOrders.stream()
                .filter(order -> !reviewRepository.existsByProduct_ProductIdAndOrder_OrderIdAndUser_UserId(
                        UUID.fromString(productId),
                        order.getOrderId(),
                        user.getUserId()
                ))
                .map(order -> new ReviewEligibilityDTO(order.getOrderId(), order.getOrderDate())) // Map to DTO
                .collect(Collectors.toList());
    }




}
