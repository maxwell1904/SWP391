package com.unleashed.service;


import com.unleashed.config.SystemUserProperties;
import com.unleashed.dto.*;
import com.unleashed.dto.mapper.UserMapper;
import com.unleashed.dto.mapper.ViewUserMapper;
import com.unleashed.entity.Role;
import com.unleashed.entity.User;
import com.unleashed.exception.CustomException;
import com.unleashed.repo.UserRepository;
import com.unleashed.repo.UserRoleRepository;
import com.unleashed.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RestController
@RequestMapping("/api/user")
public class UserService {

    @Autowired

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final UserRoleService userRoleService;
    private final EmailService emailService;
    private final ViewUserMapper viewUserMapper;
    private final SystemUserProperties systemUserProperties;


    @Autowired
    private RankService rankService;

    @Autowired
    public UserService(UserRepository userRepository,
                       UserRoleRepository userRoleRepository,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       UserMapper userMapper,
                       UserRoleService userRoleService,
                       EmailService emailService,
                       ViewUserMapper viewUserMapper,
                       SystemUserProperties systemUserProperties) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.userMapper = userMapper;
        this.userRoleService = userRoleService;
        this.emailService = emailService;
        this.viewUserMapper = viewUserMapper;
        this.systemUserProperties = systemUserProperties;
    }

    @Transactional
    @PutMapping("/update-password")
    public ResponseDTO updatePassword(@RequestBody ChangePasswordDTO changePasswordDTO) {

        ResponseDTO responseDTO = new ResponseDTO();

        try {
            if (changePasswordDTO.getUserEmail() == null || changePasswordDTO.getUserEmail().isEmpty()) {
                throw new CustomException(" User email is missing in request!", HttpStatus.BAD_REQUEST);
            }

            User user = userRepository.findByUserEmail(changePasswordDTO.getUserEmail())
                    .orElseThrow(() -> new CustomException(" User not found", HttpStatus.NOT_FOUND));
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            if (!passwordEncoder.matches(changePasswordDTO.getOldPassword(), user.getUserPassword())) {
                throw new CustomException(" Password is incorrect", HttpStatus.BAD_REQUEST);
            } else {
                user.setUserPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
                userRepository.save(user);
                responseDTO.setStatusCode(HttpStatus.OK.value());
                responseDTO.setMessage("Password updated successfully!");
            }
        } catch (CustomException e) {
            responseDTO.setStatusCode(400);
            responseDTO.setMessage("Password update failed!");
        } catch (Exception e) {
            responseDTO.setStatusCode(400);
            responseDTO.setMessage("Password update failed!");
        }
        return responseDTO;
    }

    @Transactional(readOnly = true)
    public Page<DiscountUserViewDTO> searchUsersForAssignment(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("userFullname").ascending());
        Page<User> userPage = userRepository.searchByTerm(searchTerm, pageable);

        return userPage.map(user -> new DiscountUserViewDTO(
                user.getUserId().toString(),
                user.getUserUsername(),
                user.getUserEmail(),
                user.getUserFullname(),
                user.getUserImage()
        ));
    }

    public ResponseDTO login(UserDTO userDTO) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            String identifier = userDTO.getUsername() == null ? "" : userDTO.getUsername().trim();

            Optional<User> userOptional = userRepository.findByUsernameOrEmailInsensitive(identifier);

            User user = userOptional.orElseThrow(() -> new CustomException("Username or password is wrong! Please try again", HttpStatus.NOT_FOUND));
            if (!user.getIsUserEnabled()) {
                boolean isCustomerAccount = user.getRole() != null
                        && Objects.equals(user.getRole().getId(), 2);

                if (isCustomerAccount) {
                    sendActivationEmail(user);
                    responseDTO.setStatusCode(HttpStatus.FORBIDDEN.value());
                    responseDTO.setMessage("Your account is not activated. We have sent another confirmation email.");
                    responseDTO.setEmail(user.getUserEmail());
                    return responseDTO;
                }

                throw new CustomException("User account is disabled. Please contact us for support.", HttpStatus.FORBIDDEN);
            }

            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(BCryptPasswordEncoder.BCryptVersion.$2A, 10);
            boolean isPasswordMatched = passwordEncoder.matches(userDTO.getPassword(), user.getUserPassword());

            // Support legacy plaintext records and transparently migrate to bcrypt on first successful login.
            if (!isPasswordMatched && Objects.equals(user.getUserPassword(), userDTO.getPassword())) {
                user.setUserPassword(passwordEncoder.encode(userDTO.getPassword()));
                userRepository.save(user);
                isPasswordMatched = true;
            }

            if (!isPasswordMatched) {
                throw new BadCredentialsException("Username or password is wrong! Please try again");
            }

            if (user.getUserGoogleId() != null) {
                throw new CustomException("Please login with Google account", HttpStatus.FORBIDDEN);
            }

            if (rankService.hasRegistered(user) && rankService.isRankExpired(user)) {
                if (rankService.checkDownRank(user)) rankService.downRank(user);
            }

            var token = jwtUtil.generateUserToken(user);
            responseDTO.setStatusCode(HttpStatus.OK.value());
            responseDTO.setToken(token);
            responseDTO.setExpirationTime("1 Day");
            responseDTO.setMessage("Successful");

        } catch (CustomException e) {
            responseDTO.setStatusCode(e.getStatusCode());
            responseDTO.setMessage(e.getMessage());
        } catch (BadCredentialsException e) {
            responseDTO.setStatusCode(HttpStatus.UNAUTHORIZED.value());
            responseDTO.setMessage("Username or password is wrong! Please try again");
        } catch (Exception e) {
            responseDTO.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            responseDTO.setMessage("An unexpected error occurred during login: " + e.getMessage());
        }
        return responseDTO;
    }

    public User findByGoogleId(String googleId) {
        return userRepository.findByUserGoogleId(googleId).orElse(null);
    }

    public User create(User user) {
//        System.out.println("user pass:"+user.getUserPassword());
        PasswordEncoder encode = new BCryptPasswordEncoder(BCryptPasswordEncoder.BCryptVersion.$2A, 10);
        user.setUserPassword(encode.encode(user.getUserPassword()));
        return userRepository.save(user);
    }

    public ResponseDTO handleGoogleLogin(String googleId, String email, String fullName, String userImage) {
        ResponseDTO responseDTO = new ResponseDTO();

        User user = findByGoogleId(googleId);

        // --- Case 1: User exists ---
        if (user != null) {
            // If the user exists but their account is disabled, they haven't activated it.
            if (!user.getIsUserEnabled()) {
                sendActivationEmail(user);
                responseDTO.setStatusCode(HttpStatus.FORBIDDEN.value());
                responseDTO.setMessage("Your account is not activated. We have sent another confirmation email.");
                responseDTO.setEmail(user.getUserEmail());
                return responseDTO;
            }

            // User is active, proceed with login
            if (rankService.hasRegistered(user) && rankService.isRankExpired(user)) {
                if (rankService.checkDownRank(user)) rankService.downRank(user);
            }

            try {
                // For social logins, we don't need to authenticate with a password.
                // We trust Google. We find the user and generate a token for them directly.
                var token = jwtUtil.generateUserToken(user);
                responseDTO.setStatusCode(HttpStatus.OK.value());
                responseDTO.setToken(token);
                responseDTO.setExpirationTime("1 Day");
                responseDTO.setMessage("Successful");
            } catch (Exception e) {
                responseDTO.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                responseDTO.setMessage("Error during login: " + e.getMessage());
            }
            return responseDTO;
        }

        // --- Case 2: New user via Google ---
        else {
            // Before creating, check if the email is already in use by a non-Google account
            if (existsByEmail(email)) {
                responseDTO.setStatusCode(HttpStatus.CONFLICT.value());
                responseDTO.setMessage("An account with this email already exists. Please log in with your password.");
                return responseDTO;
            }

            User newUser = new User();
            newUser.setUserGoogleId(googleId);
            newUser.setUserUsername(email);
            newUser.setUserEmail(email);
            newUser.setUserFullname(fullName);
            newUser.setUserImage(userImage);


            String generatedPassword = email.substring(0, email.indexOf("@")) + email.length();
            newUser.setUserPassword(generatedPassword);

            newUser.setRole(userRoleService.findById(2));
            newUser.setIsUserEnabled(false);

            User savedUser = create(newUser);

            // Send the activation email
            sendActivationEmail(savedUser);

            responseDTO.setStatusCode(HttpStatus.CREATED.value());
            responseDTO.setMessage("Account created. Please check your email to activate your account.");
            responseDTO.setEmail(savedUser.getUserEmail());
            return responseDTO;
        }
    }

    /**
     * Helper method to send a confirmation email.
     * You can place this within your UserService.
     */
    private void sendActivationEmail(User user) {
        // Generate JWT Token with user ID and expiration for email confirmation
        String jwtToken = jwtUtil.generateStringToken(user.getUserId() + "registration", 7 * 24 * 60 * 60 * 1000);
        String confirmationLink = "http://localhost:8080/api/auth/confirm-registration/" + user.getUserUsername() + "?token=" + jwtToken;

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        SimpleDateFormat yearFormat = new SimpleDateFormat("yyyy");
        String currentDateTime = dateFormat.format(new Date());
        String currentYear = yearFormat.format(new Date());

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
                + "<p style=\"color: #555; font-size: 16px; line-height: 1.5;\">Hello " + user.getUserFullname() + ",</p>"
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

        emailService.sendHtmlMessage(user.getUserEmail(), "Confirm Your Registration", htmlContent);
    }

    public User findByEmail(String userEmail) {
        return userRepository.findByUserEmail(userEmail).orElse(null);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUserUsername(username);
    }

    public boolean existsByEmail(String userEmail) {
        return userRepository.existsByUserEmail(userEmail);
    }

    public User findById(String userId) {
        return userRepository.findById(UUID.fromString(userId)).orElse(null);
    }


    @Transactional
    public User updatePassword(User user, String newPassword) {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        String encodedPassword = encoder.encode(newPassword);

//        System.out.println("ENCODING PASSWORD: " + encodedPassword);

        user.setUserPassword(encodedPassword);
        return userRepository.save(user);
    }


    @Transactional
    public User updateEnable(User user, boolean enable) {
        user.setIsUserEnabled(enable);
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserInfo(String userId, UpdateUserDTO updatedUserInfo) {
        Optional<User> existingUserOptional = userRepository.findById(UUID.fromString(userId));

        if (existingUserOptional.isPresent()) {
            User existingUser = existingUserOptional.get();

            // Log toàn bộ dữ liệu từ frontend
//            System.out.println(" Received from frontend: " + updatedUserInfo);

            if (!existingUser.getUserUsername().equals(updatedUserInfo.getUsername())) {
                if (userRepository.existsByUserUsername(updatedUserInfo.getUsername())) {
                    throw new CustomException("Username is already taken. Please choose another.", HttpStatus.CONFLICT);
                }
            }

            // Cập nhật thông tin
            existingUser.setUserUsername(updatedUserInfo.getUsername()); //hereeeeeeeee
            existingUser.setUserFullname(updatedUserInfo.getFullName());
            existingUser.setUserImage(updatedUserInfo.getUserImage());


            if (updatedUserInfo.getUserPhone() != null && !updatedUserInfo.getUserPhone().trim().isEmpty()) {
                existingUser.setUserPhone(updatedUserInfo.getUserPhone());
//                System.out.println("Updated userPhone: " + updatedUserInfo.getUserPhone());
            } else {
//                System.out.println("Skipped updating userPhone (null or empty).");
            }

            existingUser.setUserAddress(updatedUserInfo.getUserAddress());


//            System.out.println("Saving to DB: " + existingUser);

            // Lưu vào database
            User updatedUser = userRepository.save(existingUser);

            // Kiểm tra dữ liệu sau khi lưu
//            System.out.println("Saved userPhone in DB: " + updatedUser.getUserPhone());

            return updatedUser;
        } else {
            System.err.println("User not found with ID: " + userId);
            return null;
        }
    }


    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findByUsername(String username) {
        return userRepository.findByUserUsername(username)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<ViewInfoDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        ViewUserMapper viewUserMapper;
        return users.stream()
                .map(user -> new ViewInfoDTO(user.getUserId().toString(),
                        user.getUserUsername(),
                        user.getUserEmail(),
                        user.getUserFullname(),
                        user.getUserPhone(),
                        user.getUserImage(),
                        user.getIsUserEnabled(),
                        user.getRole().getRoleName(),
                        user.getUserCurrentPaymentMethod(),
                        user.getUserAddress(),
                        user.getUserCreatedAt(),
                        user.getUserUpdatedAt(),
                        user.getUserRank() == null ? null : user.getUserRank().getRank(),
                        user.getUserGoogleId() == null ? null : user.getUserGoogleId())
                )
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateUserDetails(String userId, AdminUpdateDTO adminUpdateDTO) throws CustomException {
        User existingUser = findById(userId);
        if (existingUser == null) {
            throw new CustomException("User not found", HttpStatus.NOT_FOUND);
        }
        if (existingUser.getRole().getRoleName().equalsIgnoreCase(userRoleService.findById(1).getRoleName())) {
            throw new CustomException("User is admin", HttpStatus.FORBIDDEN);
        }
        existingUser.setIsUserEnabled(adminUpdateDTO.getEnable());
        userRepository.save(existingUser);
    }

    public PageImpl<User> getAllUser(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "userCreatedAt"));
        List<Role> rolesToInclude = userRoleRepository.findAll();

        Page<User> userPage;
        if (search != null && !search.trim().isEmpty()) {
            userPage = userRepository.findByRolesAndSearch(rolesToInclude, search.trim(), pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        return new PageImpl<>(userPage.getContent(), pageable, userPage.getTotalElements());
    }

    @Transactional
    public boolean deleteUserById(String userId) throws CustomException {
        if (!userRepository.existsById(UUID.fromString(userId))) {
            throw new CustomException("User not found", HttpStatus.NOT_FOUND);
        }
        userRepository.deleteById(UUID.fromString(userId));
        return true;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public User createStaffAccount(User user) throws CustomException {
        if (existsByEmail(user.getUserEmail())) {
            throw new CustomException("Email already exists!", HttpStatus.BAD_REQUEST);
        }

        if (existsByUsername(user.getUserUsername())) {
            throw new CustomException("Username already exists!", HttpStatus.BAD_REQUEST);
        }

        if (user.getUserEmail() == null || user.getUserEmail().trim().isEmpty()) {
            throw new CustomException("Email is required!", HttpStatus.BAD_REQUEST);
        }

        if (user.getUserUsername() == null || user.getUserUsername().trim().isEmpty()) {
            throw new CustomException("Username is required!", HttpStatus.BAD_REQUEST);
        }

        String temporaryPassword = generateTemporaryPassword();


        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(BCryptPasswordEncoder.BCryptVersion.$2A, 10);
        user.setUserPassword(encoder.encode(temporaryPassword));

        user.setIsUserEnabled(false);

        user.setRole(userRoleService.findById(3));

//        user.setCurrentPaymentMethod(userDTO.getCurrentPaymentMethod());
        user.setUserAddress(user.getUserAddress());

        User savedUser = userRepository.save(user);
        sendStaffFirstLoginEmail(savedUser);
        return savedUser;
    }

    private String generateTemporaryPassword() {
        String raw = UUID.randomUUID().toString().replace("-", "");
        return "Tmp" + raw.substring(0, 9) + "1A";
    }

    private String resolveFrontendBaseUrl() {
        String fromProperty = System.getProperty("FRONTEND_BASE_URL");
        if (fromProperty != null && !fromProperty.isBlank()) {
            return fromProperty.trim();
        }

        String fromEnv = System.getenv("FRONTEND_BASE_URL");
        if (fromEnv != null && !fromEnv.isBlank()) {
            return fromEnv.trim();
        }

        return "http://localhost:3000";
    }

    private void sendStaffFirstLoginEmail(User user) {
        String setupToken = jwtUtil.generateStringToken(user.getUserId() + "staff-first-login", 24 * 60 * 60 * 1000);
        String frontendBaseUrl = resolveFrontendBaseUrl();
        String resetLink = frontendBaseUrl
            + "/staff/activate-password?source=staff&email="
                + URLEncoder.encode(user.getUserEmail(), StandardCharsets.UTF_8)
                + "&token="
                + setupToken;

        String htmlContent = "<div style=\"font-family: Arial, sans-serif; text-align: center; padding: 20px;\">"
                + "<h2 style=\"color: #2563eb;\">Staff Account Created</h2>"
                + "<p style=\"color: #555; font-size: 16px;\">Hello " + user.getUserFullname() + ",</p>"
                + "<p style=\"color: #555; font-size: 16px;\">An administrator has created your staff account. Please set your password to activate your account.</p>"
                + "<p style=\"color: #555; font-size: 16px;\"><strong>Username:</strong> " + user.getUserUsername() + "</p>"
                + "<a href=\"" + resetLink + "\" style=\"display:inline-block;padding:10px 20px;font-size:16px;color:white;background-color:#2563eb;text-decoration:none;border-radius:5px;\">Set Password & Activate</a>"
                + "<p style=\"color:#555; font-size:14px; margin-top:20px;\">This link will expire in 24 hours.</p>"
                + "</div>";

        emailService.sendHtmlMessage(user.getUserEmail(), "Activate your staff account", htmlContent);
    }

    public User getUserById(String userId) throws CustomException {
        User user = findById(userId);
        if (user == null) {
            throw new CustomException("User not found", HttpStatus.NOT_FOUND);
        }

        return user;
    }


    public ViewInfoDTO getUserInfoByUsername(String username) {
        User user = findByUsername(username);
        if (user != null) {
            return mapUserToViewInfoDTO(user);
        }
        return null;
    }

    private ViewInfoDTO mapUserToViewInfoDTO(User user) {
        ViewInfoDTO viewInfoDTO = new ViewInfoDTO();
        viewInfoDTO.setUserId(user.getUserId().toString());
        viewInfoDTO.setUsername(user.getUserUsername());
        viewInfoDTO.setUserEmail(user.getUserEmail());
        viewInfoDTO.setFullName(user.getUserFullname());
        viewInfoDTO.setUserPhone(user.getUserPhone());
        viewInfoDTO.setUserImage(user.getUserImage());
        viewInfoDTO.setEnable(user.getIsUserEnabled());
        viewInfoDTO.setRole(String.valueOf(user.getRole().getRoleName()));
        viewInfoDTO.setCurrentPaymentMethod(user.getUserCurrentPaymentMethod());
        viewInfoDTO.setUserAddress(user.getUserAddress());
        viewInfoDTO.setUserCreatedAt(user.getUserCreatedAt());
        viewInfoDTO.setUserUpdatedAt(user.getUserUpdatedAt());
        viewInfoDTO.setRank(user.getUserRank() == null ? null : user.getUserRank().getRank());
        viewInfoDTO.setUserGoogleId(user.getUserGoogleId());
        return viewInfoDTO;
    }

    public ViewInfoDTO getUserInfoById(String userId) {
        Optional<User> userOptional = userRepository.findById(UUID.fromString(userId));
        return userOptional.map(this::mapUserToViewInfoDTO).orElse(null);
    }

    public UserDTO getCurrentUser(String userId) {
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        return new UserDTO(
                user.getUserId().toString(),
                user.getUserUsername(),
                null, // Không trả password
                user.getUserEmail(), // Đảm bảo có userEmail
                user.getUserFullname(),
                user.getUserImage(),
                user.getUserPhone(),
                user.getIsUserEnabled(),
                user.getRole(),
                user.getUserCurrentPaymentMethod(),
                user.getUserAddress(),
                user.getUserCreatedAt(),
                user.getUserUpdatedAt(),
                user.getUserRank().getRank()
        );
    }

    @PutMapping("/updateprofile")
    @Transactional
    public UserDTO updateUserProfile(@RequestBody Map<String, Object> updatedUserInfo) {
        //System.out.println("Received update request: " + updatedUserInfo);

        String userId = (String) updatedUserInfo.get("userId");
        if (userId == null || userId.isEmpty()) {
            throw new CustomException("User ID is missing in request!", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        user.setUserEmail((String) updatedUserInfo.get("email"));
        user.setUserFullname((String) updatedUserInfo.get("fullName"));
        user.setUserPhone((String) updatedUserInfo.get("phoneNumber"));
        user.setUserImage((String) updatedUserInfo.get("userImage"));

        userRepository.save(user);

        return new UserDTO(
                user.getUserId().toString(),
                user.getUserUsername(),
                null,
                user.getUserEmail(),
                user.getUserFullname(),
                user.getUserImage(),
                user.getUserPhone(),
                user.getIsUserEnabled(),
                user.getRole(),
                user.getUserCurrentPaymentMethod(),
                user.getUserAddress(),
                user.getUserCreatedAt(),
                user.getUserUpdatedAt(),
                user.getUserRank().getRank()
        );
    }

    public boolean disableAccount(String userId) {
        Optional<User> userOptional = userRepository.findById(UUID.fromString(userId));
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setIsUserEnabled(false);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public void logout(String token) {
        jwtUtil.revokeToken(token);
    }

    /**
     * Updates the address for a specific user.
     * This method is called by the OrderService after an order is placed.
     *
     * @param userId     The ID of the user to update.
     * @param newAddress The new address to be saved.
     */
    @Transactional
    public void updateUserAddress(String userId, String newAddress) {
        if (userId == null || newAddress == null || newAddress.trim().isEmpty()) {
            // Return silently. The order creation is more critical than the address update.
            // Throwing an exception here would cause the entire order to fail.
            return;
        }

        // Find the user by their ID
        Optional<User> userOptional = userRepository.findById(UUID.fromString(userId));

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setUserAddress(newAddress);
            userRepository.save(user);
        }
    }


    /**
     * Updates the last used payment method for a specific user.
     * This is called by the OrderService after an order is successfully placed.
     *
     * @param userId            The ID of the user to update.
     * @param paymentMethodName The name of the payment method (e.g., "COD", "VNPAY").
     */
    @Transactional
    public void updateUserPaymentMethod(String userId, String paymentMethodName) {
        if (userId == null || paymentMethodName == null || paymentMethodName.trim().isEmpty()) {
            return;
        }

        userRepository.findById(UUID.fromString(userId)).ifPresent(user -> {
            user.setUserCurrentPaymentMethod(paymentMethodName);
            userRepository.save(user);
        });
    }


    @Transactional
    public User findOrCreateSystemUser() {
        String systemUsername = systemUserProperties.username();

        return userRepository.findByUserUsername(systemUsername)
                .orElseGet(() -> {
                    User systemUser = new User();
                    systemUser.setUserUsername(systemUserProperties.username());
                    systemUser.setUserFullname(systemUserProperties.fullname());
                    systemUser.setUserEmail(systemUserProperties.email());
                    systemUser.setUserPassword(systemUserProperties.password());
                    systemUser.setIsUserEnabled(false);
                    Role customerRole = new Role();
                    customerRole.setId(2);
                    systemUser.setRole(customerRole);

                    return userRepository.save(systemUser);
                });
    }

    @Transactional
    public void findOrCreateDefaultPrivilegedUsersForDev() {
        ensureFixedPrivilegedUser("admin123", "admin123@unleashed.local", "Admin Tester", "admin123", 1);
        ensureFixedPrivilegedUser("staff123", "staff123@unleashed.local", "Staff Tester", "staff123", 3);
    }

    private void ensureFixedPrivilegedUser(String username,
                                           String email,
                                           String fullname,
                                           String rawPassword,
                                           int roleId) {
        Role role = userRoleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalStateException("Role not found with ID: " + roleId));

        PasswordEncoder encoder = new BCryptPasswordEncoder(BCryptPasswordEncoder.BCryptVersion.$2A, 10);

        Optional<User> existingUser = userRepository.findByUserUsername(username);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            boolean changed = false;

            if (user.getRole() == null || !Objects.equals(user.getRole().getId(), roleId)) {
                user.setRole(role);
                changed = true;
            }

            if (!Boolean.TRUE.equals(user.getIsUserEnabled())) {
                user.setIsUserEnabled(true);
                changed = true;
            }

            if (user.getUserEmail() == null || user.getUserEmail().isBlank()) {
                user.setUserEmail(email);
                changed = true;
            }

            if (user.getUserFullname() == null || user.getUserFullname().isBlank()) {
                user.setUserFullname(fullname);
                changed = true;
            }

            if (user.getUserPassword() == null || !encoder.matches(rawPassword, user.getUserPassword())) {
                user.setUserPassword(encoder.encode(rawPassword));
                changed = true;
            }

            if (changed) {
                userRepository.save(user);
            }
            return;
        }

        User user = new User();
        user.setUserUsername(username);
        user.setUserEmail(email);
        user.setUserFullname(fullname);
        user.setUserPassword(encoder.encode(rawPassword));
        user.setIsUserEnabled(true);
        user.setRole(role);

        userRepository.save(user);
    }



}
