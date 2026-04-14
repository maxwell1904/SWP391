package com.unleashed.entity;

import com.unleashed.entity.composite.CommentParentId;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "comment_parent", schema = "dbo")
public class CommentParent {
    @EmbeddedId
    private CommentParentId id;

    //TODO [Reverse Engineering] generate columns from DB
}