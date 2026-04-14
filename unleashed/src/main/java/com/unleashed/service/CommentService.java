package com.unleashed.service;

import com.unleashed.dto.CommentDTO;
import com.unleashed.dto.NotificationDTO;
import com.unleashed.dto.ProductReviewDTO;
import com.unleashed.entity.*;
import com.unleashed.entity.composite.CommentParentId;
import com.unleashed.repo.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final CommentParentRepository commentParentRepository;
    private final ReviewService reviewService;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final UserService userService;

    public CommentService(CommentRepository commentRepository,
                          ReviewRepository reviewRepository,
                          UserRepository userRepository,
                          CommentParentRepository commentParentRepository,
                          ReviewService reviewService,
                          ProductRepository productRepository,
                          NotificationService notificationService,
                          UserService userService) {
        this.commentRepository = commentRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.commentParentRepository = commentParentRepository;
        this.reviewService = reviewService;
        this.productRepository = productRepository;
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @Transactional
    public Comment createComment(CommentDTO commentDTO) {
        // 1. Find user by username
        Optional<User> userOptional = userRepository.findByUserUsername(commentDTO.username);
        if (userOptional.isEmpty()) {
            // If the user is not found, throw an exception
            throw new RuntimeException("User does not exist!");
        }
        User user = userOptional.get();
        // 2. Check if the user has created a review
        List<Review> reviewOptional = reviewRepository.findByUserAndProduct_ProductId(user, UUID.fromString(commentDTO.productId));
        Optional<Product> reProduct = productRepository.findById(UUID.fromString(commentDTO.productId));
        if (reProduct.isEmpty()) {
            throw new RuntimeException("Product not found with id: " + commentDTO.productId);
        }
        Product reviewProduct = reProduct.get();
        if (reviewOptional.isEmpty()) {
            // Nếu là ADMIN, tự động tạo review mặc định
            if (user.getRole().getId() == 1 || user.getRole().getId() == 3) {
                Review review = new Review();
                review.setUser(user);
                review.setOrder(null);
                review.setReviewRating(null);
                review.setProduct(reviewProduct);
                review.setComments(null);
                // Lưu vào DB và gán vào reviewOptional
                Review savedReview = reviewRepository.save(review);
                reviewOptional = List.of(savedReview);
            } else {
                throw new RuntimeException("User has not created a review!");
            }
        }

// Lấy review hiện có hoặc review vừa tạo cho ADMIN
        Review review = reviewOptional.get(reviewOptional.size() - 1);

        // 3. Create a new comment
        Comment newComment = new Comment();
        newComment.setReview(review);
        newComment.setCommentContent(commentDTO.comment.getCommentContent());
        // The created and updated timestamps are set automatically via @PrePersist in the entity
        Comment savedComment = commentRepository.save(newComment);

        // 4. If a parentCommentId is provided, create the relationship in the comment_parent table

        if (commentDTO.commentParentId != null) {
            CommentParent commentParent = new CommentParent();
            CommentParentId cpId = new CommentParentId();
            cpId.setCommentParentId(commentDTO.commentParentId);
            cpId.setCommentId(savedComment.getId());
            commentParent.setId(cpId);

            commentParentRepository.save(commentParent);
        }

        return savedComment;
    }



    /**
     * --- NEW SERVICE LOGIC FOR REPLIES ---
     * Adds a reply to a parent comment. Validation is simpler than a top-level review.
     */
    @Transactional
    public Comment addCommentReply(CommentDTO commentDTO, User replyingUser) {
        // Validation: Ensure the parent comment exists
        Comment parentComment = commentRepository.findById(commentDTO.getCommentParentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent comment not found."));

        // A reply is still linked to the original Review. We find it via the parent comment.
        Review associatedReview = parentComment.getReview();
        if (associatedReview == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not find the original review associated with this comment thread.");
        }

        // The user who is replying is the one making the new comment.
        // We link this new comment to the same original review context by creating a new 'Review' entry for the user's action.
        Review reviewForReply = new Review();
        reviewForReply.setUser(replyingUser);
        reviewForReply.setProduct(associatedReview.getProduct());
        reviewForReply.setOrder(associatedReview.getOrder());
        Review savedReview = reviewRepository.save(reviewForReply);

        Comment newComment = new Comment();
        newComment.setReview(savedReview);
        newComment.setCommentContent(commentDTO.getComment().getCommentContent());

        Comment savedComment = commentRepository.save(newComment);

        // Link the new comment to its parent
        commentRepository.createCommentParentLink(savedComment.getId(), parentComment.getId());

        // --- START: Notification Logic (Revised) ---
        try {
            User parentCommentAuthor = parentComment.getReview().getUser();

            if (replyingUser.getUserId().equals(parentCommentAuthor.getUserId())) {
                return savedComment;
            }

            User systemUser = userService.findOrCreateSystemUser();

            String notificationTitle = "New Reply to Your Comment";
            String displayMessage = replyingUser.getUserFullname() + " replied to your comment.";
            String productId = associatedReview.getProduct().getProductId().toString();
            Integer replyId = savedComment.getId();

            // Embed context into the content string: {Message}|{productId}|{replyId}
            String notificationContent = String.join("|", displayMessage, productId, replyId.toString());

            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setNotificationTitle(notificationTitle);
            notificationDTO.setNotificationContent(notificationContent);
            notificationDTO.setUserName(systemUser.getUsername()); // Sender is 'System'
            notificationDTO.setUserNames(List.of(parentCommentAuthor.getUsername())); // Recipient list

            notificationService.addNotification(notificationDTO);

        } catch (Exception e) {
            // Log the error but do not fail the comment operation.
            System.err.println("Failed to create notification for reply: " + e.getMessage());
            e.printStackTrace();
        }

        return savedComment;
    }


    @Transactional
    public void deleteComment(Integer commentId, String username) {
        Comment commentToDelete = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found."));

        User userRequestingDelete = userRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        boolean isAuthor = commentToDelete.getReview().getUser().getUserId().equals(userRequestingDelete.getUserId());
        boolean isAdminOrStaff = userRequestingDelete.getRole().getId() == 1 || userRequestingDelete.getRole().getId() == 3;

        if (!isAuthor && !isAdminOrStaff) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this comment.");
        }

        recursivelyDeleteReplies(commentId);

        commentRepository.deleteParentLink(commentId);

        commentRepository.deleteById(commentId);
    }

    private void recursivelyDeleteReplies(Integer parentId) {
        List<Comment> replies = commentRepository.findRepliesByParentId(parentId);
        for (Comment reply : replies) {

            recursivelyDeleteReplies(reply.getId());

            commentRepository.deleteParentLink(reply.getId());

            commentRepository.deleteById(reply.getId());
        }
    }


    public List<Integer> findAncestorIds(Integer commentId) {
        List<Integer> ancestorIds = new ArrayList<>();
        Optional<Integer> currentParentId = commentRepository.findParentIdByCommentId(commentId);

        // Loop until we no longer find a parent
        while (currentParentId.isPresent()) {
            Integer parentId = currentParentId.get();
            ancestorIds.add(parentId);
            currentParentId = commentRepository.findParentIdByCommentId(parentId);
        }

        // The list is from child-to-root, reverse it to be root-to-child
        Collections.reverse(ancestorIds);
        return ancestorIds;
    }

    public Page<ProductReviewDTO> findDescendants(Integer commentId, Pageable pageable) {
        Page<Comment> commentPage = commentRepository.findDescendantsByCommentId(commentId, pageable);

        // We need to convert Comment entities to the DTO format the frontend expects
        List<ProductReviewDTO> dtos = commentPage.getContent().stream().map(comment -> {
            ProductReviewDTO dto = new ProductReviewDTO();
            dto.setCommentId(comment.getId());
            dto.setReviewComment(comment.getCommentContent());
            dto.setCreatedAt(comment.getCommentCreatedAt());
            dto.setUpdatedAt(comment.getCommentUpdatedAt());
            if (comment.getReview() != null && comment.getReview().getUser() != null) {
                dto.setFullName(comment.getReview().getUser().getUsername());
                dto.setUserImage(comment.getReview().getUser().getUserImage());
            }
            return dto;
        }).collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, commentPage.getTotalElements());
    }


}
