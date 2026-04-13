package com.unleashed.repo;

import com.unleashed.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    @Query("SELECT c FROM Comment c " +
            "JOIN CommentParent cp ON c.id = cp.id.commentId " +
            "WHERE cp.id.commentParentId = :parentCommentId")
        // Lấy comment con theo comment gốc
    List<Comment> findChildCommentsByParentCommentId(@Param("parentCommentId") Integer parentCommentId);

    @Modifying
    @Query(value = "INSERT INTO comment_parent (comment_id, comment_parent_id) VALUES (:commentId, :parentId)", nativeQuery = true)
    void createCommentParentLink(@Param("commentId") Integer commentId, @Param("parentId") Integer parentId);

    @Query("""
            SELECT c FROM Comment c
            WHERE c.review.id = :reviewId AND c.id NOT IN (
                SELECT cp.id.commentId FROM CommentParent cp
            )
            """)
    Optional<Comment> findRootCommentByReviewId(@Param("reviewId") Integer reviewId);


    @Query("SELECT c FROM Comment c JOIN CommentParent cp ON c.id = cp.id.commentId WHERE cp.id.commentParentId = :parentId")
    List<Comment> findRepliesByParentId(@Param("parentId") Integer parentId);

    @Query("SELECT cp.id.commentParentId FROM CommentParent cp WHERE cp.id.commentId = :commentId")
    Optional<Integer> findParentIdByCommentId(@Param("commentId") Integer commentId);

    @Modifying
    @Query(value = "DELETE FROM dbo.comment_parent WHERE comment_id = :commentId", nativeQuery = true)
    void deleteParentLink(@Param("commentId") Integer commentId);


    @Query(
            value = """
    WITH CommentTree AS (
        SELECT c.*
        FROM dbo.comment c
        JOIN dbo.comment_parent cp ON c.comment_id = cp.comment_id
        WHERE cp.comment_parent_id = :rootCommentId

        UNION ALL

        SELECT c.*
        FROM dbo.comment c
        JOIN dbo.comment_parent cp ON c.comment_id = cp.comment_id
        JOIN CommentTree ct ON cp.comment_parent_id = ct.comment_id
    )
    SELECT c.*
    FROM CommentTree c
    ORDER BY c.comment_created_at ASC
    """,
            countQuery = """
    WITH CommentTree AS (
        SELECT c.comment_id
        FROM dbo.comment c
        JOIN dbo.comment_parent cp ON c.comment_id = cp.comment_id
        WHERE cp.comment_parent_id = :rootCommentId
        UNION ALL
        SELECT c.comment_id
        FROM dbo.comment c
        JOIN dbo.comment_parent cp ON c.comment_id = cp.comment_id
        JOIN CommentTree ct ON cp.comment_parent_id = ct.comment_id
    )
    SELECT COUNT(*) FROM CommentTree
    """,
            nativeQuery = true
    )
    Page<Comment> findDescendantsByCommentId(@Param("rootCommentId") Integer rootCommentId, Pageable pageable);

}