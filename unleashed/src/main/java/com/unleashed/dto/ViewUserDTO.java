package com.unleashed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Date;

@Data
@AllArgsConstructor
public class ViewUserDTO {
    private String userId;
    private String username;
    private String userEmail;
    private String role;
    private Boolean enable;
    private Date userCreatedAt;
    private Date userUpdatedAt;
}
