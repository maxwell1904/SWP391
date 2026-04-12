package com.unleashed.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentDeleteRequestDTO {
    @NotBlank
    private String username;
}