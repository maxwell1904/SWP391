package com.unleashed.dto;

import com.unleashed.entity.Comment;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CommentDTO {
    public String username;
    public Integer commentParentId;
    public String productId;
    public Comment comment;
}
