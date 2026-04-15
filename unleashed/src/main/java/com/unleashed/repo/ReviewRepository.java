package com.unleashed.repo;

import com.unleashed.dto.DashboardReviewDTO;
import com.unleashed.entity.Comment;
import com.unleashed.entity.Product;
import com.unleashed.entity.Review;
import com.unleashed.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    @Query("select o from  Order o ")
    List<Object[]> findReviewByProductId(@Param("productId") UUID productId);

    @Query("SELECT r FROM Review r " +
            "JOIN FETCH r.product p " +
            "JOIN FETCH r.user u " +
            "WHERE p.productId = :productId " +
            "ORDER BY r.id DESC")
    List<Review> findAllReviewsByProductId(@Param("productId") UUID productId);

    @Query("SELECT c FROM Comment c " +
            "JOIN FETCH c.review r " +
            "JOIN FETCH r.user u " +
            "WHERE r.id IN :reviewIds " +
            "ORDER BY c.commentCreatedAt ASC")
    List<Comment> findAllCommentsByReviewIds(@Param("reviewIds") List<Integer> reviewIds);

    @Query("""
                SELECT c FROM Comment c
                WHERE c.id NOT IN (
                    SELECT cp.id.commentId FROM CommentParent cp
                )
                AND c.id IN :commentIds
            """)
    List<Comment> findRootCommentsByCommentIds(@Param("commentIds") List<Integer> commentIds);

    @Query("SELECT c FROM Comment c " +
            "WHERE c.id IN " +
            "(SELECT cp.id.commentId FROM CommentParent cp WHERE cp.id.commentParentId = :commentId)")
    List<Comment> findChildComments(@Param("commentId") Integer commentId);

    @Query("SELECT c.id.commentParentId FROM CommentParent c " +
            "WHERE c.id.commentId = :commentId")
    Integer findParentComments(@Param("commentId") Integer commentId);

    boolean existsByProduct_ProductIdAndOrder_OrderIdAndUser_UserId(UUID productId, String orderId, UUID userId);

    @Query(value = """
            SELECT NEW com.unleashed.dto.DashboardReviewDTO(
                c.id,
                r.id,
                r.product.productId,
                u.userFullname,
                u.userImage,
                c.commentCreatedAt,
                c.commentContent,
                CASE WHEN cp IS NULL THEN r.reviewRating ELSE NULL END,
                p.productName,
                v2.variationImage,
                parent_comment.commentContent,
                false
            )
            FROM Comment c
            JOIN c.review r
            JOIN r.user u
            JOIN r.product p
            LEFT JOIN Variation v2 ON v2.product.productId = r.product.productId
                AND v2.id = (SELECT MIN(v3.id) FROM Variation v3 WHERE v3.product.productId = r.product.productId)
            LEFT JOIN CommentParent cp ON c.id = cp.id.commentId
            LEFT JOIN Comment parent_comment ON cp.id.commentParentId = parent_comment.id
            WHERE (:search IS NULL OR :search = ''
                OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(u.userFullname) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(c.commentContent) LIKE LOWER(CONCAT('%', :search, '%'))
            )
            GROUP BY 
                c.id, r.id, p.productId, u.userFullname, u.userImage, c.commentCreatedAt, 
                c.commentContent, cp.id, r.reviewRating, p.productName, v2.variationImage, parent_comment.commentContent
            """,
            countQuery = """
            SELECT COUNT(DISTINCT c.id)
            FROM Comment c
            JOIN c.review r
            JOIN r.user u
            JOIN r.product p
            WHERE (:search IS NULL OR :search = ''
                OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(u.userFullname) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(c.commentContent) LIKE LOWER(CONCAT('%', :search, '%'))
            )
            """)
    Page<DashboardReviewDTO> findAllDashboardReviews(Pageable pageable, @Param("search") String search);

    @Query("SELECT COALESCE(count(r.reviewRating), 0) as totalRating, COALESCE(avg(r.reviewRating), 0) as avgRating FROM Review r join Product p on r.product.productId = p.productId WHERE p.productId = :productId")
    List<Object[]> countAndAvgRatingByProductId(@Param("productId") UUID productId);

    @Query("select r from Review r")
    List<Review> findReviewsByOrderDetailId(@Param("variationSingleId") Integer variationSingleId);

    @Query(
            "select r from Review r " +
                    "where r.user.userUsername = :userUsername"
    )
    List<Review> findAllByUser_Username(String userUsername);

    List<Review> findByUser(User user);

    List<Review> findByUserAndProduct_ProductId(User user, UUID productProductId);

    /**
     * Fetches only reviews that have a rating (i.e., they are top-level reviews).
     */
    @Query(value = "SELECT r FROM Review r WHERE r.product.productId = :productId AND r.reviewRating IS NOT NULL ORDER BY r.id DESC",
            countQuery = "SELECT COUNT(r) FROM Review r WHERE r.product.productId = :productId AND r.reviewRating IS NOT NULL")
    Page<Review> findTopLevelReviewsByProductId(@Param("productId") UUID productId, Pageable pageable);

    /**
     * Fetches child comments for a given parent.
     */
    @Query(value = "SELECT c FROM Comment c WHERE c.id IN (SELECT cp.id.commentId FROM CommentParent cp WHERE cp.id.commentParentId = :commentId) ORDER BY c.commentCreatedAt ASC",
            countQuery = "SELECT COUNT(c) FROM Comment c WHERE c.id IN (SELECT cp.id.commentId FROM CommentParent cp WHERE cp.id.commentParentId = :commentId)")
    Page<Comment> findChildCommentsPaginated(@Param("commentId") Integer commentId, Pageable pageable);


    @Query(
            value = "SELECT r FROM Review r WHERE r.user.userUsername = :userUsername AND r.reviewRating IS NOT NULL",
            countQuery = "SELECT COUNT(r) FROM Review r WHERE r.user.userUsername = :userUsername AND r.reviewRating IS NOT NULL"
    )
    Page<Review> findAllByUser_Username(String userUsername, Pageable pageable);


    boolean existsByProductAndUser(Product product, User user);







}