package com.unleashed.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViewInfoDTO {
    private String userId;
    private String username;
    private String userEmail;
    private String fullName;
    private String userPhone;
    private String userImage;
    private Boolean enable;
    private String role;
    private String currentPaymentMethod;
    private String userAddress;
    private OffsetDateTime userCreatedAt;
    private OffsetDateTime userUpdatedAt;
    private String userGoogleId;
}
