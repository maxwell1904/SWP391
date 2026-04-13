package com.unleashed.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDTO {
    private String userUsername;
    private String userPassword;
    private String userEmail;
    private String userFullname;
    private String userPhone;
}