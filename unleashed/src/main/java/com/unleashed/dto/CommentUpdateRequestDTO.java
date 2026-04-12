package com.unleashed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentUpdateRequestDTO {
    @NotBlank(message = "Comment content cannot be blank")
    @Size(max = 500, message = "Comment content cannot exceed 500 characters")
    private String commentContent;

    private String username;
}