package com.unleashed.rest;

import com.unleashed.dto.DeleteAccountRequestDTO;
import com.unleashed.dto.UpdateUserDTO;
import com.unleashed.dto.ViewInfoDTO;
import com.unleashed.dto.ResponseDTO;
import com.unleashed.entity.User;
import com.unleashed.service.UserService;
import com.unleashed.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
public class AccountRestController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AccountRestController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // View personal info
    @PreAuthorize("hasAnyAuthority('CUSTOMER','STAFF','ADMIN')")
    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        ViewInfoDTO viewInfoDTO = userService.getUserInfoByUsername(currentUsername);
        if (viewInfoDTO != null) {
            return ResponseEntity.ok(viewInfoDTO);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User not found.");
    }


    // Staff viewed by Admin
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/admin/{userId}")
    public ResponseEntity<?> getStaffInfoById(@PathVariable String userId) {
        ViewInfoDTO viewInfoDTO = userService.getUserInfoById(userId);
        if (viewInfoDTO != null && viewInfoDTO.getRole().equals("STAFF")) {
            return ResponseEntity.ok(viewInfoDTO);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only view staff information.");
    }

    // Update personal info
    @PreAuthorize("hasAnyAuthority('CUSTOMER','ADMIN')")
    @PutMapping
    public ResponseEntity<?> updateUserInfo(@RequestBody UpdateUserDTO updatedUserInfo) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        User currentUser = userService.findByUsername(currentUsername);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User not found.");
        }
        User updated = userService.updateUserInfo(currentUser.getUserId().toString(), updatedUserInfo);
        if (updated != null) {
            String newToken = jwtUtil.generateUserToken(updated);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User information updated successfully.");
            response.put("token", newToken);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Failed to update user information.");
        }
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @PostMapping("/request-delete")
    public ResponseEntity<?> requestDeleteAccount(@RequestBody(required = false) DeleteAccountRequestDTO deleteAccountRequestDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            currentUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        }

        User currentUser = userService.findByUsername(currentUsername);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        String password = deleteAccountRequestDTO == null ? null : deleteAccountRequestDTO.getPassword();
        ResponseDTO responseDTO = userService.requestAccountDeactivation(currentUser.getUserId().toString(), password);
        return ResponseEntity.status(responseDTO.getStatusCode()).body(responseDTO);
    }

}
