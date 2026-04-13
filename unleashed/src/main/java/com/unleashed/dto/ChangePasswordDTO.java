package com.unleashed.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordDTO {
    private String userEmail;
    private String oldPassword;
    private String newPassword;
}
