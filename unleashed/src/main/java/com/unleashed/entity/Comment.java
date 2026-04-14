package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "comment", schema = "dbo")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id")
    @JsonIgnore
    private Review review;

    @Nationalized
    @Column(name = "comment_content")
    private String commentContent;

    @Column(name = "comment_created_at")
    private OffsetDateTime commentCreatedAt;

    @Column(name = "comment_updated_at")
    private OffsetDateTime commentUpdatedAt;

    @PrePersist
    protected void onCreate() {
        setCommentCreatedAt(OffsetDateTime.now());
        setCommentUpdatedAt(OffsetDateTime.now());
    }

    @PreUpdate
    protected void onUpdate() {
        setCommentUpdatedAt(OffsetDateTime.now());
    }
}