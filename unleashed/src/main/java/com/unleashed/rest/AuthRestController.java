package com.unleashed.rest;


import com.unleashed.dto.RegisterDTO;
import com.unleashed.dto.ResetPasswordDTO;
import com.unleashed.dto.ResponseDTO;
import com.unleashed.dto.UserDTO;
import com.unleashed.entity.User;
import com.unleashed.exception.CustomException;
import com.unleashed.service.CustomUserDetailsService;
import com.unleashed.service.VoucherService;
import com.unleashed.service.EmailService;
import com.unleashed.service.UserRoleService;
import com.unleashed.service.UserService;
import com.unleashed.util.GoogleUtil;
import com.unleashed.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

@Transactional
@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    private final UserService userService;
    private final UserRoleService userRoleService;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final VoucherService voucherService;
    private final CustomUserDetailsService customUserDetailsService;

    private final AuthenticationManager authenticationManager;


    @Autowired
    public AuthRestController(UserService userService, UserRoleService userRoleService, JwtUtil jwtUtil, AuthenticationManager authenticationManager, EmailService emailService, VoucherService voucherService, CustomUserDetailsService customUserDetailsService) {
        this.userService = userService;
        this.userRoleService = userRoleService;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.voucherService = voucherService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO> login(@RequestBody UserDTO userDTO) {
        ResponseDTO responseDTO = userService.login(userDTO);
        return ResponseEntity.status(responseDTO.getStatusCode()).body(responseDTO);
    }

    @PostMapping("/register")
    public ResponseEntity<ResponseDTO> register(@RequestBody RegisterDTO registerDTO) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            if (userService.existsByUsername(registerDTO.getUserUsername())) {
                throw new CustomException(registerDTO.getUserUsername() + " already exists", HttpStatus.CONFLICT);
            }
            if (userService.existsByEmail(registerDTO.getUserEmail())) {
                throw new CustomException(registerDTO.getUserEmail() + " already exists", HttpStatus.CONFLICT);
            }

            User newUser = new User();
            newUser.setUserUsername(registerDTO.getUserUsername());
            newUser.setUserPassword(registerDTO.getUserPassword());
            newUser.setUserEmail(registerDTO.getUserEmail());
            newUser.setUserFullname(registerDTO.getUserFullname());
            newUser.setUserPhone(registerDTO.getUserPhone());

            // Set default values
            newUser.setRole(userRoleService.findById(2));
            newUser.setIsUserEnabled(false);

            // Pass the fully populated User object to the service
            User savedUser = userService.create(newUser);

            // Generate JWT Token with user ID and expiration for email confirmation
            String jwtToken = jwtUtil.generateStringToken(savedUser.getUserId() + "registration", 7 * 24 * 60 * 60 * 1000);

            String confirmationLink = "http://localhost:8080/api/auth/confirm-registration/" + savedUser.getUserUsername() + "?token=" + jwtToken;

            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            SimpleDateFormat yearFormat = new SimpleDateFormat("yyyy");
            String currentDateTime = dateFormat.format(new Date());
            String currentYear = yearFormat.format(new Date());

            // Use data from the savedUser object for the email content
            String htmlContent = "<!DOCTYPE html>"
                    + "<html lang=\"en\">"
                    + "<head>"
                    + "<meta charset=\"UTF-8\">"
                    + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                    + "<title>Registration Confirmation</title>"
                    + "</head>"
                    + "<body style=\"margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;\">"
                    + "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">"
                    + "<tr>"
                    + "<td align=\"center\" style=\"padding: 20px;\">"
                    + "<table width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);\">"
                    + "<tr>"
                    + "<td align=\"center\" style=\"padding: 30px;\">"
                    + "<h2 style=\"color: #4CAF50; margin-bottom: 20px;\">Registration Confirmation</h2>"
                    + "<p style=\"color: #555; font-size: 16px; line-height: 1.5;\">Hello " + savedUser.getUserFullname() + ",</p>"
                    + "<p style=\"color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 30px;\">Thank you for registering! Please click the button below to confirm your registration:</p>"
                    + "<a href=\"" + confirmationLink + "\" style=\"display: inline-block; padding: 12px 24px; font-size: 16px; color: white; background-color: #4CAF50; text-decoration: none; border-radius: 5px; font-weight: bold;\">Confirm Registration</a>"
                    + "<p style=\"color: #555; font-size: 14px; margin-top: 30px; line-height: 1.5;\">If you didn't register, please ignore this email.</p>"
                    + "<p style=\"color: #555; font-size: 14px; line-height: 1.5;\">Confirmation sent on: " + currentDateTime + "</p>"
                    + "</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td align=\"center\" style=\"padding: 20px; background-color: #f8f8f8;\">"
                    + "<p style=\"color: #999; font-size: 12px; margin: 0;\">© " + currentYear + " Unleashed Workshop. All rights reserved.</p>"
                    + "</td>"
                    + "</tr>"
                    + "</table>"
                    + "</td>"
                    + "</tr>"
                    + "</table>"
                    + "</body>"
                    + "</html>";

            emailService.sendHtmlMessage(savedUser.getUserEmail(), "Confirm Your Registration", htmlContent);

            responseDTO.setStatusCode(HttpStatus.CREATED.value());
            responseDTO.setMessage("We have sent an email to your email for confirmation, please check it!");

        } catch (CustomException e) {
            responseDTO.setStatusCode(HttpStatus.CONFLICT.value());
            responseDTO.setMessage(e.getMessage());
        }
        return ResponseEntity.status(responseDTO.getStatusCode()).body(responseDTO);
    }


    @GetMapping("/confirm-registration/{username}")
    public void confirmRegistration(
            @PathVariable String username,
            @RequestParam String token,
            HttpServletResponse response) throws IOException {

        User user = userService.findByUsername(username);
        String userId = user.getUserId().toString();

        // Parse the token
        String parsedUserId = jwtUtil.extractSubject(token);

        // Check if the user ID from the token matches the provided user ID
        if (parsedUserId.equals(userId + "registration")) {
            User activatedUser = user.getIsUserEnabled() ? user : userService.updateEnable(user, true);
            String authToken = jwtUtil.generateUserToken(activatedUser);
            String redirectUrl = "http://localhost:3000/confirm-registration/success?token="
                    + URLEncoder.encode(authToken, StandardCharsets.UTF_8);
            response.sendRedirect(redirectUrl);
        } else {
            response.sendRedirect("http://localhost:3000/confirm-registration/error");
        }


    }


    @GetMapping("/google-callback")
    public ResponseEntity<ResponseDTO> handleGoogleLoginSuccess(HttpServletRequest httpServletRequest) {
        String token = httpServletRequest.getParameter("token");
        Map<String, String> googleInfo = new GoogleUtil().getGoogleInfoFromToken(token);

        String email = googleInfo.get("email");
        String googleId = googleInfo.get("google_id");
        String fullName = googleInfo.get("name");
        String userImage = googleInfo.get("picture");

        ResponseDTO responseDTO = userService.handleGoogleLogin(googleId, email, fullName, userImage);

        return ResponseEntity.status(responseDTO.getStatusCode()).body(responseDTO);
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ResetPasswordDTO resetPasswordDTO) {
        String email = resetPasswordDTO.getEmail();
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not found");
        }

        String jwtToken = jwtUtil.generateStringToken(user.getUserId() + "forgot-password", 15 * 60 * 1000);

        // Send email with the reset link
        String resetLink = "http://localhost:3000/reset-password?email=" + email + "&token=" + jwtToken;
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        SimpleDateFormat yearFormat = new SimpleDateFormat("yyyy");
        String currentDateTime = dateFormat.format(new Date());
        String currentYear = yearFormat.format(new Date());

        String emailContent = "<div style=\"font-family: Arial, sans-serif; text-align: center; padding: 20px;\">"
                + "<h2 style=\"color: #4CAF50;\">Password Reset Request</h2>"
                + "<p style=\"color: #555; font-size: 16px;\">Hello " + user.getUserFullname() + ",</p>"
                + "<p style=\"color: #555; font-size: 16px;\">You have requested to reset your password. Please click the button below to reset your password:</p>"
                + "<a href=\"" + resetLink + "\" style=\"display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #4CAF50; text-decoration: none; border-radius: 5px;\">Reset Password</a>"
                + "<p style=\"color: #555; font-size: 14px; margin-top: 20px;\">If you did not request a password reset, please ignore this email.</p>"
                + "<p style=\"color: #555; font-size: 14px;\">Request sent on: " + currentDateTime + "</p>"
                + "<p style=\"color: #999; font-size: 12px;\">&copy; " + currentYear + " Unleashed Official. All rights reserved.</p>"
                + "</div>";

        emailService.sendHtmlMessage(email, "Reset Password", emailContent);

        return ResponseEntity.ok("Password reset link sent to your email.");
    }


    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDTO resetPasswordDTO, HttpServletRequest request) {

        User user = userService.findByEmail(resetPasswordDTO.getEmail());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not found");
        }

        // Forgot Password
        if (resetPasswordDTO.getOldPassword() == null) {
            if (jwtUtil.isTokenExpired(resetPasswordDTO.getToken())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Your token was expired");
            }

            String parsedUserId = jwtUtil.extractSubject(resetPasswordDTO.getToken());
            String forgotPasswordSubject = user.getUserId() + "forgot-password";
            String staffFirstLoginSubject = user.getUserId() + "staff-first-login";
            boolean isForgotPasswordToken = parsedUserId.equals(forgotPasswordSubject);
            boolean isStaffFirstLoginToken = parsedUserId.equals(staffFirstLoginSubject);

            if (isForgotPasswordToken || isStaffFirstLoginToken) {
                String newPassword = resetPasswordDTO.getNewPassword();
                userService.updatePassword(user, newPassword);

                if (isStaffFirstLoginToken) {
                    User activatedUser = Boolean.TRUE.equals(user.getIsUserEnabled())
                            ? user
                            : userService.updateEnable(user, true);

                    ResponseDTO responseDTO = new ResponseDTO();
                    responseDTO.setStatusCode(HttpStatus.OK.value());
                    responseDTO.setMessage("Your account has been activated successfully.");
                    responseDTO.setToken(jwtUtil.generateUserToken(activatedUser));
                    responseDTO.setExpirationTime("1 Day");
                    return ResponseEntity.ok(responseDTO);
                }

                return ResponseEntity.ok("Your password has been reset");
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Your token was incorrect");
            }

        } else { // Reset Password
            PasswordEncoder encoder = new BCryptPasswordEncoder(BCryptPasswordEncoder.BCryptVersion.$2A, 10);
            if (encoder.matches(resetPasswordDTO.getOldPassword(), user.getUserPassword())) {

                String newPassword = resetPasswordDTO.getNewPassword();
                userService.updatePassword(user, newPassword);

                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                SimpleDateFormat yearFormat = new SimpleDateFormat("yyyy");
                String currentDateTime = dateFormat.format(new Date());
                String currentYear = yearFormat.format(new Date());

                // Nội dung email thông báo
                String emailContent = "<div style=\"font-family: Arial, sans-serif; text-align: center; padding: 20px;\">"
                        + "<h2 style=\"color: #4CAF50;\">Password Reset Confirmation</h2>"
                        + "<p style=\"color: #555; font-size: 16px;\">Hello " + user.getUserFullname() + ",</p>"
                        + "<p style=\"color: #555; font-size: 16px;\">Your password has been successfully reset. You can now log in with your new password.</p>"
                        + "<p style=\"color: #555; font-size: 14px; margin-top: 20px;\">If you did not reset your password, please contact support immediately.</p>"
                        + "<p style=\"color: #555; font-size: 14px;\">Request processed on: " + currentDateTime + "</p>"
                        + "<p style=\"color: #999; font-size: 12px;\">&copy; " + currentYear + " Unleashed Official. All rights reserved.</p>"
                        + "</div>";

                // Gửi email
                emailService.sendHtmlMessage(resetPasswordDTO.getEmail(), "Password Reset Confirmation", emailContent);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Old password is incorrect");
            }
        }

        return ResponseEntity.ok("Password reset successful");
    }

    @DeleteMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Authorization header");
            }

            String token = authorizationHeader.substring(7); // Remove "Bearer " prefix
            userService.logout(token);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                SecurityContextHolder.getContext().setAuthentication(null);
            }

            return ResponseEntity.ok("Logout successful");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid token: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Logout failed: " + e.getMessage());
        }
    }

    @GetMapping("/token")
    public ResponseEntity<?> token(@RequestHeader("Authorization") String authorizationHeader) {
        try{

            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Authorization header");
            }
            String token = authorizationHeader.substring(7);
            String username = jwtUtil.extractSubject(token);
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

            if (!jwtUtil.isValidToken(token, userDetails)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Token invalid or account disabled");
            }

            return ResponseEntity.status(HttpStatus.OK).body("Token valid");
        } catch (CustomException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getMessage());
        } catch (IllegalArgumentException | JwtException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid token: " + e.getMessage());
        }
    }
}

